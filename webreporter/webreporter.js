import '../lib/collections';
import { Template } from 'meteor/templating'
import { Session } from 'meteor/session'

if(Meteor.isClient){
  Meteor.startup(function(){
    Session.set("filterState", 'all')


    // TODO: should run again when page refreshes,
    // generating TypeError: Cannot read property 'call' of undefined
    // Meteor.call("runAllTests", function(err,res){
    //   console.log('err', err);
    //   console.log('res', res);
    // })

    Blaze.render(Template.wrapper, $( "body" )[0])
  });
}

Template.eachTest = Template.fromString(`
  <div>
      <p class="uk-text-left eachTitle" data-title="{{this.data.title}}">
        <span style="{{#if icon this.data.state }} color: #84BF99 {{else}} color: #F37996 {{/if}}">
          {{#if icon this.data.state }} &nbsp; &bull; {{else}} &nbsp; &#10005; {{/if}}
         </span> {{ this.data.title }}
      </p>
  </div>
`)

Template.eachTest.helpers({
  stringify: function(obj){
    return JSON.stringify( obj )
  },
  icon: function( state ){
    if (state === 'passed'){
      return true
    } else {
      return false
    }
  }
});

Template.runner = Template.fromString(`
  <h5 class="uk-text-center"> {{caps this.env}} </h5>
  {{#each listSuites this.env}}
    <p class="eachTitle"> {{this}} </p>
    {{#each listTests ../env this.data.title }}
      {{>eachTest this }}
    {{/each}}
  {{/each}}
`)

function filteredTests (env, parentTitle) {
  if(!parentTitle){ parentTitle = { $exists: true}}
  var stateQuery
  if ( Session.get('filterState') !== 'all' ){
    stateQuery =  Session.get('filterState')
  }else{
    stateQuery = { $exists: true}
  }

  var titleQuery
  if ( Session.get('grepString') ){
    titleQuery =  { $regex: Session.get('grepString'), $options: 'i' }
  }else{
    titleQuery = { $exists: true }
  }

  return MochaTestLogs.find({
    environment: env,
    event:'test end',
    'data.state': stateQuery,
    'data.title': titleQuery,
    'data.parent.title': parentTitle
  }).fetch()
}
Template.runner.helpers({
  listSuites: function(env){
    return _.map( filteredTests(env), function(e){
      return e.data.parent.title
    });
  },
  listTests: function(env, parentTitle){
    return filteredTests(env, parentTitle)
  },
  caps : function (string) {
     return string.charAt(0).toUpperCase() + string.slice(1);
  }
});


Template.eachTest.events({
  "click .eachTitle": function(event, template){
    const target = event.currentTarget
    var keyword = $( target ).data( "title" )
    Session.set('grepString', keyword)
  }
});

Template.report = Template.fromString(`
  <div class="uk-modal-dialog">
      <div class="uk-modal-header">
        <div class="uk-align-center uk-grid">
          <div>
            <form class="uk-grid-small" uk-grid>
              <div class="uk-width-1-2@s uk-flex">
                <div id="rerun-tests">
                  <span class="uk-align-left uk-align-middle" uk-icon="icon: refresh"></span>
                </div>
                <div class="uk-button-group">
                  <button class="uk-button {{#if toggleButton 'passed'}}  uk-button-primary {{else}} uk-button-default {{/if}}  btn-test-state" data-state="passed">Passing</button>
                  <button class="uk-button {{#if toggleButton 'all'}}  uk-button-primary {{else}} uk-button-default {{/if}}  btn-test-state" data-state="all">All</button>
                  <button class="uk-button {{#if toggleButton 'failed'}}  uk-button-primary {{else}} uk-button-default {{/if}}  btn-test-state" data-state="failed">Failing</button>
                </div>
              </div>
              <div class="uk-width-1-2@s uk-flex">
                <div class="uk-width-3-4@s" >
                  <input class="uk-input" type="text" value="{{grepString}}" placeholder="Grep" id="grep-form">
                </div>
                <div class="uk-align-right">
                  <label><input class="uk-checkbox" type="checkbox"> invert </label>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div class="uk-modal-body" uk-overflow-auto>
      <div class="uk-grid-collapse uk-child-width-expand@s uk-text-left" uk-grid>
          <div>
              <div class="uk-margin">
                {{>runner env='client'}}
              </div>
          </div>
          <div>
              <div class="uk-margin">
                {{>runner env='server'}}

              </div>
          </div>
        </div>
      </div>
  </div>
`);



Template.report.helpers({
  grepString: function(obj){
    return Session.get('grepString')
  },
  toggleButton: function(type){
    if (type === Session.get('filterState') ){
      return true
    }
    return false
  },
  stringify: function(obj){
    return JSON.stringify( obj )
  },

});


Template.report.events({
  "click .btn-test-state": function(event, template){
    event.preventDefault()
    const target = event.currentTarget
    var state = $( target ).data( "state" )
    Session.set("filterState", state)
  },
  'keyup #grep-form': function (event) {
    const target = event.currentTarget;
    const text = target.value;
    _.debounce(function() {
       Session.set('grepString', text)
    }, 500)()
  },
  "click #rerun-tests": function(event, template){
    //TODO: this is broken
    Meteor.call("runAllTests")
  },
});


Template.wrapper = Template.fromString(`
  <div style="position: fixed; bottom: 0; left: 0; padding:10px" uk-toggle="target: #full-report-modal" >
    <div style="width: 50px;
    height: 50px;
    -webkit-border-radius: 25px;
    -moz-border-radius: 25px;
    border-radius: 25px;
    background: {{color}};"></div>

    <div id="full-report-modal" class="uk-modal-container" uk-modal>
      {{>report}}
    </div>
  </div>
`);

//
Template.wrapper.rendered = function(){
  UIkit.modal('#full-report-modal', {});
}

Template.wrapper.helpers({
  color: function(){
    var summary = MochaTestLogs.findOne({event:'summary'})
    console.log('summary', summary);

    console.log("MochaTestLogs summary", JSON.stringify(MochaTestLogs.find({event:'summary'}).count()))
    console.log("MochaTestLogs end", JSON.stringify(MochaTestLogs.find({event:'end'}).count()))

    if ( summary && summary.fail > 0 ){
      return '#F37996' //red
    }
    if ( summary && summary.fail === 0 ){
      return '#84BF99' //green
    }
    return '#4BC7EA' //blue
  }
});
