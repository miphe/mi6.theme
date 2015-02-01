describe("XPGraph", function() {

  jasmine.getFixtures().fixturesPath = '/mi6.theme/jasmine/fixtures';

  beforeEach(function() {
    loadFixtures('XPGraph.html');
    xpg = new ExperienceGraph('.xp-graph');
    xpg.init();
  });

  it("should start with first category active, and no other", function() {
    expect(xpg.nav.find('li:first a')).toHaveClass('is-active');
    var $all       = xpg.nav.find('li');
    var $notFirsts = $all.not('li:first');
    $.each($notFirsts, function($itm) {
      expect($itm).not.toHaveClass('is-active');
    })
  });

  it("should switch active category when clicked", function() {
    expect(xpg.nav.find('li:first a')).toHaveClass('is-active');
    xpg.nav.find('li:nth-child(3) a').trigger('click');
    expect(xpg.nav.find('li:first a')).not.toHaveClass('is-active');
    expect(xpg.nav.find('li:nth-child(3) a')).toHaveClass('is-active');
  });

  it("should gather data properly", function() {
    var expectation = {
      id: "jasmine",
      label: "Jasmine",
      bar_1: 30,
      bar_2: 30,
      bar_3: 80,
      content: "I believe in Jasmine."
    };

    var $el = xpg.nav.find('li:nth-child(2)');
    var response = xpg.gatherData($el);
    expect(_.isEqual(expectation, response)).toEqual(true);
  });

  it("should clear old graph data", function() {
    // Makes sure the content is not cleared at first
    var $cleared = xpg.module.find('.subject-content:empty');
    expect($cleared.length).not.toBeGreaterThan(0);

    // Cleares content
    xpg.clearOldGraphData();

    // Makes sure content is cleared
    $cleared = xpg.module.find('.subject-content:empty');
    expect($cleared.length).toBeGreaterThan(0);

    // TODO: Add test for a bar as well.
  });

  it("Should broadcast subject-change event on navigation click", function() {
    var $el = xpg.nav.find('li:nth-child(2) a');
    var spyEvent = spyOnEvent(xpg.module, 'subject-change');
    $el.click();
    expect('subject-change').toHaveBeenTriggeredOn(xpg.module);
    expect(spyEvent).toHaveBeenTriggered();
  });

  // TODO: Write test.
  // it("should apply new graph data", function() {

  // });
});
