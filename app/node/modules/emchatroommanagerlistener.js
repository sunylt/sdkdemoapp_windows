'use strict';

const EventEmitter = require('events').EventEmitter;
const easemobNode = require('./../load');
const EMChatroom = require('./emchatroom');

//EMChatroomManagerListener object callback interface number.
const emChatroomManagerListenerCount = 9;

/**
 * Easemob EMChatroomManagerListener implementation.
 */

/**
 * EMChatroomManagerListener constructor.
 * @constructor
 */
function EMChatroomManagerListener() {
  var self = this;
  self._eventEmitter = new EventEmitter();
  self._eventEmitter.setMaxListeners(emChatroomManagerListenerCount);
  self._listener = new easemobNode.EMChatroomManagerListener();
  self._listener.onLeaveChatroom = function (chatroom, reason) {
    self._eventEmitter.emit('onLeaveChatroom',  new EMChatroom(chatroom), reason);
  };
  self._listener.onMemberJoinedChatroom = function (chatroom, member) {
    self._eventEmitter.emit('onMemberJoinedChatroom', new EMChatroom(chatroom), member);
  };
  self._listener.onMemberLeftChatroom = function (chatroom, member) {
    self._eventEmitter.emit('onMemberLeftChatroom', new EMChatroom(chatroom), member);
  };
  self._listener.onAddMutesFromChatroom = function (chatroom, mutes, muteExpire) {
    self._eventEmitter.emit('onAddMutesFromChatroom', new EMChatroom(chatroom), mutes, muteExpire);
  };
  self._listener.onRemoveMutesFromChatroom = function (chatroom, mutes) {
    self._eventEmitter.emit('onRemoveMutesFromChatroom', new EMChatroom(chatroom), mutes);
  };
  self._listener.onAddAdminFromChatroom = function (chatroom, admin) {
    self._eventEmitter.emit('onAddAdminFromChatroom', new EMChatroom(chatroom), admin);
  };
  self._listener.onRemoveAdminFromChatroom = function (chatroom, admin) {
    self._eventEmitter.emit('onRemoveAdminFromChatroom', new EMChatroom(chatroom), admin);
  };
  self._listener.onAssignOwnerFromChatroom = function (chatroom, newOwner, oldOwner) {
    self._eventEmitter.onAssignOwnerFromChatroom('onAssignOwnerFromChatroom', new EMChatroom(chatroom), newOwner, oldOwner);
  };
  self._listener.onUpdateAnnouncementFromChatroom = function (chatroom, announcement) {
    self._eventEmitter.onUpdateAnnouncementFromChatroom('onUpdateAnnouncementFromChatroom', new EMChatroom(chatroom), announcement);
  };
}

/**
 * Callback user when user is kicked out from a chatroom or the chatroom is destroyed.
 * @param {EMChatroomManagerListener~onLeaveChatroomCallback} callback ????????????
 * @return {void}
 */
EMChatroomManagerListener.prototype.onLeaveChatroom = function (callback) {
  this._eventEmitter.on('onLeaveChatroom', callback);
};

/**
 * @function EMChatroomManagerListener~onLeaveChatroomCallback
 * @param {EMChatroom} chatroom ???????????????
 * @param {String} reason ????????????
 * @return {void}
 */

/**
 * Callback user when a user join the chatroom.
 * @param {EMChatroomManagerListener~onMemberJoinedChatroomCallback} callback
 * @return {void}
 */
EMChatroomManagerListener.prototype.onMemberJoinedChatroom = function (callback) {
  this._eventEmitter.on('onMemberJoinedChatroom', callback);
};

/**
 * @function EMChatroomManagerListener~onMemberJoinedChatroomCallback
 * @param {EMChatroom} chatroom ???????????????
 * @param {String} member ???????????????ID
 * @return {void}
 */

/**
 * Callback user when a user leave the chatroom.
 * @param {EMChatroomManagerListener~onMemberLeftChatroomCallback} callback ????????????
 * @return {void}
 */
EMChatroomManagerListener.prototype.onMemberLeftChatroom = function (callback) {
  this._eventEmitter.on('onMemberLeftChatroom', callback);
};

/**
 * @function EMChatroomManagerListener~onMemberLeftChatroomCallback
 * @param {EMChatroom} chatroom ???????????????
 * @param {String} member ???????????????ID
 * @return {void}
 */

/**
 * Callback user when user add to chat room mute list.
 * @param {EMChatroomManagerListener~onAddMutesFromChatroomCallback} callback ????????????
 * @return {void}
 */
EMChatroomManagerListener.prototype.onAddMutesFromChatroom = function (callback) {
  this._eventEmitter.on('onAddMutesFromChatroom', callback);
};

/**
 * @function EMChatroomManagerListener~onAddMutesFromChatroomCallback
 * @param {EMChatroom} chatroom ???????????????
 * @param {Array} mutes String mute array.
 * @param {Number} muteExpire ????????????
 * @return {void}
 */

/**
 * Callback user when user remove from chat room mute list.
 * @param {EMChatroomManagerListener~onRemoveMutesFromChatroomCallback} callback ????????????
 * @return {void}
 */
EMChatroomManagerListener.prototype.onRemoveMutesFromChatroom = function (callback) {
  this._eventEmitter.on('onRemoveMutesFromChatroom', callback);
};

/**
 * @function EMChatroomManagerListener~onRemoveMutesFromChatroomCallback
 * @param {EMChatroom} chatroom ???????????????
 * @param {Array} mutes String mute array.
 * @return {void}
 */

/**
 * Callback user when user promote to admin.
 * @param {EMChatroomManagerListener~onAddAdminFromChatroomCallback} callback ????????????
 * @return {void}
 */
EMChatroomManagerListener.prototype.onAddAdminFromChatroom = function (callback) {
  this._eventEmitter.on('onAddAdminFromChatroom', callback);
};

/**
 * @function EMChatroomManagerListener~onAddAdminFromChatroomCallback
 * @param {EMChatroom} chatroom ???????????????
 * @param {String} admin ?????????ID
 * @return {void}
 */

/**
 * Callback user when user cancel admin.
 * @param {EMChatroomManagerListener~onRemoveAdminFromChatroomCallback} callback ????????????
 * @return {void}
 */
EMChatroomManagerListener.prototype.onRemoveAdminFromChatroom = function (callback) {
  this._eventEmitter.on('onRemoveAdminFromChatroom', callback);
};

/**
 * @function EMChatroomManagerListener~onRemoveAdminFromChatroomCallback
 * @param {EMChatroom} chatroom ???????????????
 * @param {String} admin ?????????ID
 * @return {void}
 */

/**
 * Callback user when promote to chatroom owner.
 * @param {EMChatroomManagerListener~onAssignOwnerFromChatroomCallback} callback ????????????
 * @return {void}
 */
EMChatroomManagerListener.prototype.onAssignOwnerFromChatroom = function (callback) {
  this._eventEmitter.on('onAssignOwnerFromChatroom', callback);
};

/**
 * @function EMChatroomManagerListener~onAssignOwnerFromChatroomCallback
 * @param {EMChatroom} chatroom ???????????????
 * @param {String} newOwner ?????????
 * @param {String} oldOwner ?????????
 * @return {void}
 */

/**
 * Callback user when chatroom's announcement change.
 * @param {EMChatroomManagerListener~onUpdateAnnouncementFromChatroomCallback} callback ????????????
 * @return {void}
 */
EMChatroomManagerListener.prototype.onUpdateAnnouncementFromChatroom = function (callback) {
  this._eventEmitter.on('onUpdateAnnouncementFromChatroom', callback);
};

/**
 * @function EMChatroomManagerListener~onUpdateAnnouncementFromChatroomCallback
 * @param {EMChatroom} chatroom ???????????????
 * @param {String} announcement ????????????
 * @return {void}
 */

module.exports = EMChatroomManagerListener;