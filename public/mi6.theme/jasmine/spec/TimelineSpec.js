describe("Timeline", function() {

  jasmine.getFixtures().fixturesPath = '/mi6.theme/jasmine/fixtures';
  var tl;
  var anArticleEl;
  var spyEvent;

  beforeEach(function() {
    loadFixtures('Timeline.html');
    tl = new Timeline('.timeline');
  });

  describe("Initialization", function() {
    beforeEach(function() {
      spyOn(tl, 'applyListeners');
      spyOn(tl, 'selectDefault');
      tl.init();
    });

    it("should initialize timeline", function() {
      expect(tl.$timeLine).toBeInDOM();
      expect(tl.$articles.length).toBe(7);
      expect(tl.applyListeners).toHaveBeenCalled();
      expect(tl.selectDefault).toHaveBeenCalled();
    });
  });

  describe("Default article", function() {
    beforeEach(function() {
      spyEvent = spyOnEvent($('.timeline article').first(), 'click');
      tl.init();
    });

    it("should select default article initially", function() {
      expect('click').toHaveBeenTriggeredOn(tl.$articles.first());
      expect(spyEvent).toHaveBeenTriggered();
    });
  });

  describe("Article click", function() {
    beforeEach(function() {
      tl.init();
      anArticleEl = _.sample(tl.$articles);
      spyOn(tl, 'hideArticles');
      spyOn(tl, 'showArticle');
      spyOn(tl, 'deActivateYears');
      spyOn(tl, 'activateYear');

      anArticleEl.click();
    });

    it("should invoke methods on article click", function() {
      expect(tl.hideArticles).toHaveBeenCalled();
      expect(tl.showArticle).toHaveBeenCalled();
      expect(tl.deActivateYears).toHaveBeenCalled();
      expect(tl.activateYear).toHaveBeenCalled();
    });

  });

  describe("Method", function() {

    beforeEach(function() {
      tl.init();
    });

    it("should show article (showArticle)", function() {
      anArticleEl = tl.$articles[4];
      var classes = $(anArticleEl).attr('class');
      expect(classes).toContain('is-idle');
      expect(classes).not.toContain('is-showing');

      tl.showArticle($(anArticleEl));
      classes = $(anArticleEl).attr('class');
      expect(classes).toContain('is-showing');
      expect(classes).not.toContain('is-idle', 'is-faded');
    });

    it("should hide all articles (hideArticles)", function() {
      var allButFirst = _.drop(tl.$articles, 1);
      var first = tl.$articles[0];

      _.each(allButFirst, function(itm) {
        expect($(itm).attr('class')).toContain('is-idle');
      });

      expect($(first).attr('class')).not.toContain('is-idle');
      tl.hideArticles();

      _.each(tl.$articles, function(itm) {
        expect($(itm).attr('class')).toContain('is-idle');
      });
    });

    it("should activate year (activateYear)", function() {
      var $li = $(tl.$articles[4]).closest('li');
      expect($li).not.toHaveClass('is-active');
      tl.activateYear($li);
      expect($li).toHaveClass('is-active');
    });

    it("should deactivate years (deActivateYears)", function() {
      var $li = $(tl.$articles[4]).closest('li');
      var $allListItems = tl.$timeLine.find('.timeline-list > li');

      expect($li).not.toHaveClass('is-active');
      tl.activateYear($li);
      expect($li).toHaveClass('is-active');

      tl.deActivateYears();
      expect($allListItems).not.toHaveClass('is-active');
    });
  });

});
