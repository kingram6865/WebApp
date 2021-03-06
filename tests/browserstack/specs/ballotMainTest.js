const assert = require('assert');
const { clearTextInputValue, scrollThroughPage, simpleClick, simpleTextInput } = require('../utils');

const ANDROID_CONTEXT = 'WEBVIEW_org.wevote.cordova';
const IOS_CONTEXT = 'WEBVIEW_1';
const PAUSE_DURATION_MICROSECONDS = 1250;
const PAUSE_DURATION_BALLOT_LOAD = 6000;
const PAUSE_DURATION_REVIEW_RESULTS = 3000;

async function simpleCloseBootstrapModal () {
  const clickableSelector = 'button[class="close"]';
  const clickableItem = await $(clickableSelector);
  await clickableItem.click();
  await browser.pause(PAUSE_DURATION_MICROSECONDS);
}

describe('Basic cross-platform We Vote test',  () => {
  it('can visit the different pages in the app', async () => {
    // const isCordova = !!driver.getContexts;
    const isCordova = true; // Set to True when testing APK or IPA files, and false when testing in mobile browser
    const isMobile = !!driver.getContexts;
    const isDesktop = !isMobile;

    // NOTE FROM Dale: This is commented out so we can test We Vote in a mobile browser
    //  I would be curious to see what is in driver.getContexts
    if (isCordova) {
      // switch contexts and click through intro
      const contexts = await driver.getContexts();
      const context = contexts.includes(ANDROID_CONTEXT) ? ANDROID_CONTEXT : IOS_CONTEXT;
      await driver.switchContext(context);
      const firstNextButton = await $('div[data-index="0"] .intro-story__btn--bottom');
      await browser.pause(PAUSE_DURATION_MICROSECONDS);
      await firstNextButton.click();
      const secondNextButton = await $('div[data-index="1"] .intro-story__btn--bottom');
      await browser.pause(PAUSE_DURATION_MICROSECONDS);
      await secondNextButton.click();
      const thirdNextButton = await $('div[data-index="2"] .intro-story__btn--bottom');
      await browser.pause(PAUSE_DURATION_MICROSECONDS);
      await thirdNextButton.click();
      await browser.pause(PAUSE_DURATION_MICROSECONDS);
    } else {
      // navigate browser to WeVote QA site
      await browser.url('https://quality.wevote.us/ballot');
    }

    await browser.pause(PAUSE_DURATION_MICROSECONDS);
    if (isMobile) {
      // Extra pause for mobile until we can fix Issue #2225
      await browser.pause(PAUSE_DURATION_BALLOT_LOAD);
    }

    if (isDesktop) {
      // Only run on desktop until we can fix Issue #2225
      await simpleClick('changeAddressHeaderBar'); // Open the "Change Address" modal
      await simpleCloseBootstrapModal(); // Close the "Change Address" modal
    }

    // //////////////////////
    // We want to start by setting the location, which will automatically choose the next upcoming election for that address
    if (isCordova) {
      await simpleClick('changeAddressHeaderBar'); // Open the "Change Address" modal
    } else {
      await simpleClick('locationGuessEnterYourFullAddress'); // Opens the "Enter Your Full Address" link
    }
    await clearTextInputValue('addressBoxText'); // Clear the contents of this input box
    await simpleTextInput('addressBoxText','Oakland, CA 94610'); // Sets the text for the address box
    if (isDesktop) {
      // Send "Enter" since the "Google address complete" is blocking the button
      await simpleTextInput('addressBoxText', '\uE007');
    } else {
      // Send "Return" for mobile since the "Google address complete" is blocking the button
      await simpleTextInput('addressBoxText', '\uE006');
    }
    // await simpleClick('addressBoxModalSaveButton'); // Saves the new address

    await browser.pause(PAUSE_DURATION_BALLOT_LOAD);
    if (!isDesktop) {
      // Extra pause for mobile
      await browser.pause(PAUSE_DURATION_BALLOT_LOAD);
    }

    // //////////////////////
    // Next we want to switch to a known election
    await simpleClick('locationGuessEnterYourFullAddress'); // Opens the Enter Your Full Address link
    await simpleClick('ballotElectionListWithFiltersButton-6000'); // Clicks on US 2018 Midterm Election

    await browser.pause(PAUSE_DURATION_BALLOT_LOAD);

    // //////////////////////
    // Visit the candidate page
    await simpleClick('officeItemCompressedCandidateInfo-wv02cand40208'); // Clicks the candidate
    await simpleClick('backToLinkTabHeader'); // Clicks the back Ballot button

    // //////////////////////
    // Visit the office page
    await simpleClick('officeItemCompressedShowMoreFooter-wv02off19922'); // Clicks Show More link
    await simpleClick('backToLinkTabHeader'); // Clicks the back Ballot button
    await simpleClick('officeItemCompressedTopNameLink-wv02off19866'); // Clicks Office Item link
    await simpleClick('backToLinkTabHeader'); // Clicks the back Ballot button

    // Build out path that goes through a ballot
    // await simpleClick('allItemsCompletionLevelTab'); // Go to the All Items tab
    // await simpleClick('Embed'); // Go to the embed tab

    await browser.pause(PAUSE_DURATION_REVIEW_RESULTS);

    // Go to the Values tab
    if (isDesktop) {
      // Desktop screen size - HEADER TABS
      await simpleClick('valuesTabHeaderBar');
    } else {
      // Mobile or tablet screen size - FOOTER ICONS
      await simpleClick('valuesTabFooterBar');
    }

    await browser.pause(PAUSE_DURATION_REVIEW_RESULTS);

    //
    // Go to the My Friends tab // DALE: FRIENDS TEMPORARILY DISABLED
    // if (isDesktop) {
    //   // Desktop screen size - HEADER TABS
    //   await simpleClick('friendsTabHeaderBar');
    // } else {
    //   // Mobile or tablet screen size - FOOTER ICONS
    //   await simpleClick('friendsTabFooterBar');
    // }
    // await simpleTextInput('friend1EmailAddress','filipfrancetic@gmail.com');
    // await simpleClick('friendsAddAnotherInvitation');
    // await simpleClick('friendsNextButton');
    //
    // await browser.pause(PAUSE_DURATION_REVIEW_RESULTS);

    // Go to the Vote tab
    if (isDesktop) {
      // Desktop screen size - HEADER TABS
      await simpleClick('voteTabHeaderBar');
    } else {
      // Mobile or tablet screen size - FOOTER ICONS
      await simpleClick('voteTabFooterBar');
    }

    await browser.pause(PAUSE_DURATION_REVIEW_RESULTS);

    // Go back to the Ballot tab
    if (isDesktop) {
      // Desktop screen size - HEADER TABS
      await simpleClick('ballotTabHeaderBar');
    } else {
      // Mobile or tablet screen size - FOOTER ICONS
      await simpleClick('ballotTabFooterBar');
    }

    await browser.pause(PAUSE_DURATION_REVIEW_RESULTS);

    // //////////////////////
    // Review the full length of the page
    await scrollThroughPage(); // Scroll to the bottom of the ballot page
    // TODO: We will need a way to scroll back to the top of the page for the tab navigation to work in Desktop

    await browser.pause(PAUSE_DURATION_REVIEW_RESULTS);

    // TODO Figure out how to close a Material UI Dialog so we can test sign in
    // await simpleClick('signInHeaderBar'); // Open the "Sign In" modal
    // await simpleCloseModal(); // Close the "Sign In" modal

    assert(true);
  });
});
