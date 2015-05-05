import page from 'page';
import o from 'component-dom';
import title from 'title';
import t from 't-component';
import config from '../config/config.js';
import citizen from '../citizen/citizen.js';
import SigninForm from './view.js';

let externalSignin = (ctx, next) => {
  if (!config.signinUrl) return next();
  var url = config.signinUrl + '?returnUrl=' + encodeURI(location.href);
  window.location = url;
};

page('/signin', facebookSignin, externalSignin, citizen.loggedoff, (ctx, next) => {
  // Build signin view with options
  var form = new SigninForm;

  // Display section content
  o(document.body).addClass("signin-page");

  // Update page's title
  title(t('signin.login'));

  // Render signin-page into content section
  form.replace('#content');
});

page('/signin/:token', (ctx, next) => window.location = '/');

function facebookSignin(ctx, next) {
  if (!config.facebookSignin) return next();
  page('/auth/facebook');
}

function externalSignin(ctx, next) {
  if (!config.signinUrl) return next();
  var url = config.signinUrl + '?returnUrl=' + encodeURI(location.href);
  window.location = url;
}
