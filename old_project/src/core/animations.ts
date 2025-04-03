import { createAnimation, NavOptions } from '@ionic/core';

interface TransitionOptions extends NavOptions {
    progressCallback?: ((ani: Animation | undefined) => void);
    baseEl: any;
    enteringEl: HTMLElement;
    leavingEl: HTMLElement | undefined;
}

const getIonPageElement = (element: HTMLElement) => {
    if (element.classList.contains('ion-page')) {
        return element;
    }

    const ionPage = element.querySelector(
        ':scope > .ion-page, :scope > ion-nav, :scope > ion-tabs'
    );
    if (ionPage) {
        return ionPage;
    }
    return element;
};

// symthinkPageTransition function is an AnimationBuilder
// @see Interface: https://github.com/ionic-team/ionic-framework/blob/1b1b1a3800c4d044b4a3e7418f534e9271770ec6/core/src/utils/animation/animation-interface.ts#L247
// Usage: in TransitionOptions arg of IonNav
// { animationBuilder: symthinkPageTransition.bind(null, baseEl, {}) }
// where second arg is TransitionOptions for Symthink page animation
export function symthinkPageTransition(_: HTMLElement, opts: TransitionOptions) {
    const DURATION = 1000;
    console.log('using symthinkPageTransition')
    const enteringPage = createAnimation()
        .addElement(getIonPageElement(opts.enteringEl))
        .beforeRemoveClass('ion-page-invisible');

    const leavingPage = createAnimation().addElement(
        getIonPageElement(opts.leavingEl)
    );

    let rootTransition;
    rootTransition = createAnimation()
        .duration(opts.duration || DURATION)
        .easing('cubic-bezier(0.36,0.66,0.04,1)');
    
    if (opts.direction === 'forward') {
        enteringPage.fromTo('opacity', '0', '1');
        leavingPage.fromTo('opacity', '.8', '0')
            .fromTo('transform', 'translateX(0)', 'translateX(-100%)');
    } else {
        leavingPage.beforeAddClass('animating');
        leavingPage.afterRemoveClass('animating');
        leavingPage.fromTo('transform', 'translateX(0)', 'translateX(100%)');
        enteringPage.fromTo('opacity', '0.25', '1');
    }
    rootTransition.addAnimation(enteringPage);
    rootTransition.addAnimation(leavingPage);
    return rootTransition;
}
