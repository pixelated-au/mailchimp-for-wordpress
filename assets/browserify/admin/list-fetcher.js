'use strict';

const config = window.mc4wp_vars;
const i18n = window.mc4wp_vars.i18n;
const ajaxurl = window.mc4wp_vars.ajaxurl;

const m = require('mithril');

let state = {
    working: false,
    done: false,
    success: false,
};

function fetch(evt) {
    evt && evt.preventDefault();

    state.working = true;
    state.done = false;

    m.request({
        method: "POST",
        url: ajaxurl + "?action=mc4wp_renew_mailchimp_lists",
		timeout: 600000, // 10 minutes, matching max_execution_time
    }).then(function(data) {
        state.success = true;

        if(data) {
            window.setTimeout(function() { window.location.reload(); }, 3000 );
        }
    }).catch(function(data) {
        state.success = false;
	}).finally(function (data) {
        state.working = false;
        state.done = true;

        m.redraw();
    });
}

function view() {
    return m('form', {
        method: "POST",
        onsubmit: fetch.bind(this)
    }, [
        m('p', [
            m('input', {
                type: "submit",
                value: state.working ? i18n.fetching_mailchimp_lists : i18n.renew_mailchimp_lists,
                className: "button",
                disabled: !!state.working
            }),
            m.trust(' &nbsp; '),

            state.working ? [
                m('span.mc4wp-loader', "Loading..."),
                m.trust(' &nbsp; ')
            ]: '',
            state.done ? [
                state.success ? m( 'em.help.green', i18n.fetching_mailchimp_lists_done ) : m('em.help.red', i18n.fetching_mailchimp_lists_error )
            ] : ''
        ])
    ]);
}

const mount = document.getElementById('mc4wp-list-fetcher');
if( mount ) {
    // start fetching right away when no lists but api key given
    if( config.mailchimp.api_connected && config.mailchimp.lists.length === 0 ) {
        fetch();
    }

    m.mount(mount, {view});
}
