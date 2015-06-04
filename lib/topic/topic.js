/**
 * Module dependencies.
 */

import config from '../config/config';
import title from '../title/title.js';
import o from 'component-dom';
import bus from 'bus';
import debug from 'debug';
import page from 'page';
import request from '../request/request.js';
import user from '../user/user.js';
import Article from '../proposal-article/proposal-article.js';
import Options from '../proposal-options/proposal-options.js';
import Comments from '../comments-view/view.js';
import sidebar from '../sidebar/main.js';
import filter from '../topics-filter/topics-filter.js';
import locker from '../browser-lock/locker.js';

let log = debug('democracyos:topic:page');

var router = require('../router')(config);

page(router('/topic/:id'), user.optional, load, (ctx, next) => {
  bus.emit('page:render', ctx.topic);

  if (!ctx.topic) {
    log('Topic %s not found', ctx.params.id);
    return next();
  }

  sidebar.forum(ctx.params.forum);

  // Render sidebar list
  sidebar.ready(() => {
    let select = () => {
      log('select sidebar topic %s', ctx.topic.id);
      return setTimeout(sidebar.select.bind(sidebar, ctx.topic.id), 0);
    }

    select() && filter.on('reload', select);
  });

  // Clean page's content
  o('#content').empty();
  o('section.app-content').empty();

  // Build article's content container
  // and render to section.app-content
  var article = new Article(ctx.topic, ctx.path);
  article.appendTo('section.app-content');

  // Build article's meta
  // and render to section.app-content
  let options = new Options(ctx.topic, ctx.path);
  options.appendTo('section.app-content');

  // Build article's comments, feth them
  // and render to section.app-content
  let comments = new Comments(ctx.topic, ctx.path);
  comments.appendTo('section.app-content');
  comments.initialize();

  o(document.body).addClass('browser-page');
  title(ctx.topic.mediaTitle);

  log('render %s', ctx.params.id);

  bus.once('page:change', pagechange);
  function pagechange(url) {
    // restore page's original title
    title();

    // lock article's section
    locker.lock();

    // hide it from user
    o('section.app-content').addClass('hide');

    // once render, unlock and show
    bus.once('page:render', function() {
      locker.unlock();
      o('section.app-content').removeClass('hide');
    });

    // check if loading to same page
    // and if not, scroll to top
    if (url !== ctx.path) o('section#browser').scrollTop = 0;

    // don't remove 'browser-page' body class
    // if we still are in a browsing topics page
    if (/^\/$/.test(url) && config.singleForum) return;
    if (/^\/(topic|proposal)/.test(url)) return;
    o(document.body).removeClass('browser-page');
  };
});

/*
 * Load homepage data
 *
 * @param {Object} ctx page's context
 * @param {Function} next callback after load
 * @api private
 */

function load (ctx, next) {
  log('fetch for %s', ctx.params.id);

  request
  .get('/api/topic/' + ctx.params.id)
  .end(function(err, res) {
    if (!err && res.status == 404) return ctx.topic = null, next();
    if (err || !res.ok) return log('Found error: %s', err || res.error);
    ctx.topic = res.body;
    next();
  });
};