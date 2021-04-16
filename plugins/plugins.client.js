import * as dat from 'dat.gui';
import Vue from 'vue';
import VMask from 'v-mask';

import VueMq from 'vue-mq';

Vue.use(VueMq, {
    breakpoints: {
        xs: 768,
        sm: 992,
        md: 1440,
        lg: 1920,
        xl: Infinity,
    },
    defaultBreakpoint: 'md'
});

Vue.use(VMask)

window.dat = dat;