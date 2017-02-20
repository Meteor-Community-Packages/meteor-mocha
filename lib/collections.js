import { Mongo } from 'meteor/mongo';

RuntimeArgs = new Mongo.Collection("runtimeArgs");
MochaTestLogs = new Mongo.Collection("mochaTestLogs");

export { RunnerOptions }
