import page from 'page';
import o from 'component-dom';
import qs from 'qs';
import title from 'title';
import { dom } from '../render/render.js';
import FAQ from '../help-faq/view.js';
import PP from '../help-pp/view.js';
import TOS from '../help-tos/view.js';
import Glossary from '../help-glossary/view.js';
import Markdown from '../help-markdown/view.js';
import config from '../config/config.js';
import helpContainer from './help-container.jade';

let valid = (ctx, next) => {
  var p = ctx.params.page || 'markdown';
  var valid = ['markdown'];
  if (config.faq) valid.push('faq');
  if (config.tos) valid.push('terms-of-service');
  if (config.pp) valid.push('privacy-policy');
  if (config.glossary) valid.push('glossary');
  return ctx.valid = ~valid.indexOf(p), next();
};

let parse = (ctx, next) => {
  ctx.query = qs.parse(ctx.querystring);
  next();
};

page('/help/:page?', valid, parse, (ctx, next) => {
  if (!ctx.valid) return next();

  let page = ctx.params.page || 'markdown';
  let container = dom(helpContainer);
  let content = o('.help-content', container);

  // prepare wrapper and container
  let el = o('#content');
  el.empty();
  el.append(container);

  let faq = new FAQ;
  let tos = new TOS;
  let pp = new PP;
  let glossary = new Glossary(ctx.query.word);
  let markdown = new Markdown;

  // set active section on sidebar
  if (o('.active', container)) {
    o('.active', container).removeClass('active');
  }

  let menuItem = o('a[href="/help/' + page + '"]', container);
  menuItem.parent().addClass('active');

  // Set page's title
  title(o('[href="/help/' + page + '"]').text());

  // render all help pages
  if(config.frequentlyAskedQuestions) faq.appendTo(content);
  if(config.termsOfService) tos.appendTo(content);
  if(config.privacyPolicy) pp.appendTo(content);
  if(config.glossary) glossary.appendTo(content);
  markdown.appendTo(content);

  // Display current help page
  o('#' + page + '-wrapper', container).removeClass('hide');

  if (page == 'glossary') glossary.scroll();
});
