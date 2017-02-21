/* eslint-env mocha */

if (Meteor.isClient) {
  describe('Pasing client suite', () => {
    it('another test', () => {
      return 1 === 1;
    })
  })
}
