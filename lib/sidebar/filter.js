import t from 't-component';
import ToggleParent from 'toggle-parent';
import closest from 'closest';
import user from '../user/user.js';
import filter from '../topics-filter/topics-filter.js';
import View from '../view/view.js';
import render from '../render/render.js';
import template from './filter-container.jade';

let formatNumber = (v) => v <= 99 ? v + ' ' : '99+ ';

class FilterView extends View {
  constructor () {
    super(template, { filter: filter, formatNumber: formatNumber });
    this.statuses = this.find('[data-status]');
    this.open = this.find('[data-status="open"]');
    this.closed = this.find('[data-status="closed"]');
    this.current = this.find('.current-department .pull-left');
    this.sorts = this.find('[data-sort]');
    this.hideVoted = this.find('#hide-voted-filter');
  }

  switchOn () {
    // View events
    this.bind('click', '#status-filter a.btn', 'onstatusclick');
    this.bind('click', '#sort-filter ul li', 'onsortclick');
    this.bind('click', '#hide-voted-filter input[name=hide-voted]', 'onhidevotedclick');

    // Behavior events
    filter.on('change', this.bound('refresh'));
    user.on('loaded', this.bound('refresh'));
    user.on('unloaded', this.bound('refresh'));

    // Filter Dropdown
    var dropdownBtn = this.find('#sort-filter .current-department');
    this.filterDropdown = new ToggleParent(dropdownBtn[0]);
  }

  switchOff () {
    filter.off('change', this.bound('refresh'));
    user.off('loaded', this.bound('refresh'));
    user.off('unloaded', this.bound('refresh'));

    this.filterDropdown.destroy()
    this.filterDropdown = null
  }

  refresh () {
    var active = this.find('[data-status=":status"]'.replace(':status', filter.get('status')));
    var obj = this.find('li[data-sort="closing-soon"]');
    var open = formatNumber(filter.countFiltered('open'));
    var closed = formatNumber(filter.countFiltered('closed'));

    this.statuses.removeClass('active');
    active.addClass('active');
    this.open.html(open + t('sidebar.open'));
    this.closed.html(closed + t('sidebar.closed'));
    this.current.html(t(filter.sorts[filter.get('sort')].label));
    this.sorts.removeClass('active');
    this.find('[data-sort=":sort"]'.replace(':sort', filter.get('sort'))).addClass('active');
    if (user.logged()) {
      this.hideVoted.removeClass('hide');
    } else {
      this.hideVoted.addClass('hide');
    }
    if (filter.get('status') == 'closed') {
      obj.addClass('hide');
      if (filter.get('sort') == 'closing-soon') filter.set('sort', 'newest-first');
    } else {
      obj.removeClass('hide');
    }
    this.find('input#hide-voted')[0].checked = filter.get('hide-voted') ? true : null;
  }

  onstatusclick (ev) {
    ev.preventDefault();

    var target = ev.delegateTarget || closest(ev.target, '[data-status]', true);
    var status = target.getAttribute('data-status');

    filter.set('status', status);
  }

  onsortclick (ev) {
    ev.preventDefault();

    if (this.filterDropdown) this.filterDropdown.hide()

    var target = ev.delegateTarget || closest(ev.target, '[data-sort]', true);
    var sort = target.getAttribute('data-sort');

    filter.set('sort', sort);
  }

  onhidevotedclick (ev) {
    ev.preventDefault();

    var target = ev.delegateTarget || closest(ev.target, '[type=checkbox]', true);
    var checked = !!target.checked;

    filter.set('hide-voted', checked);
  }

  ready (fn) {
    filter.ready(fn);
    filter.ready(this.bound('refresh'));
  }
}

export default new FilterView;
