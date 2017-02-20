import './lib/collections';
import { Template } from 'meteor/templating'

if(Meteor.isClient){
  Meteor.startup(function(){

    // TODO: should run again when page refreshes,
    // generating TypeError: Cannot read property 'call' of undefined
    // Meteor.call("runAllTests", function(err,res){
    //   console.log('err', err);
    //   console.log('res', res);
    // })

    Blaze.render(Template.reporter, $( "body" )[0])
  });
}

Template.eachTest = Template.fromString(`
  <div>
      <p class="uk-text-left">
        <span style="{{#if icon this.data.state }} color: #84BF99 {{else}} color: #F37996 {{/if}}"> {{#if icon this.data.state }} &bull; {{else}} &#10005; {{/if}} </span> {{ this.data.title }}
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

Template.reporter = Template.fromString(`
  <div style="position: fixed; bottom: 0; left: 0; padding:10px" uk-toggle="target: #full-report-modal" >
    <div style="width: 50px;
    height: 50px;
    -webkit-border-radius: 25px;
    -moz-border-radius: 25px;
    border-radius: 25px;
    background: {{color}};"></div>

    <div id="full-report-modal" class="uk-modal-container" uk-modal>
        <div class="uk-modal-dialog">
            <div class="uk-modal-header">
              <div class="uk-align-center">
                <div class="uk-button-group">
                  <button class="uk-button uk-button-default">Passing</button>
                  <button class="uk-button uk-button-default">All</button>
                  <button class="uk-button uk-button-default">Failing</button>
                </div>
              </div>
            </div>
            <div class="uk-modal-body" uk-overflow-auto>
            <div class="uk-grid-collapse uk-child-width-expand@s uk-text-center" uk-grid>
                <div>

                    <div class="uk-padding">
                      <h4> Client </h4>

                      {{#each listSuites 'client'}}
                        {{this.data.title}}
                        {{#each listTests 'client' this.data.title }}
                          {{>eachTest this }}
                        {{/each}}
                      {{/each}}
                    </div>
                </div>
                <div>
                    <div class="uk-padding">
                      <h4> Server </h4>
                      {{#each listSuites 'server'}}
                        {{this.data.title}}
                        {{#each listTests 'server' this.data.title }}
                          {{>eachTest this }}
                        {{/each}}
                      {{/each}}
                    </div>
                </div>
              </div>
            </div>
        </div>
    </div>
  </div>
`);

//
Template.name.onRendered = function(){
  UIkit.modal('#my-id', {});
}

Template.reporter.helpers({
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
  },
  listTests: function(env, parentTitle){
    return MochaTestLogs.find({ environment: env , event:'test end', 'data.parent.title': parentTitle }).fetch()
  },
  listSuites: function(env){
    return MochaTestLogs.find({ environment: env , event:'suite'}).fetch()
  },
  stringify: function(obj){
    return JSON.stringify( obj )
  },

});
