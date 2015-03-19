
(function($) {

  Magnific = function(type, selector) {
    this.init = function() {
      var $objs = $(selector);
      var settings = {
        "type": type,
        "closeOnContentClick": true,
        "gallery": {
          "enabled": false
        }
      };

      if ($objs.length > 1) {
        settings.closeOnContentClick = false;
        settings.gallery.enabled = true;
        $objs.magnificPopup(settings);
      } else {
        $objs.magnificPopup(settings);
      }
    }
  };

  ExperienceGraph = function(selector) {
    this.init = function() {
      var $module = $(selector).first();
      $nav = typeof nav === 'undefined' ? $module.find('ul').first() : $module.find(nav).first();

      this.module = $module;
      this.nav = $nav;
      this.applyNavListener();
      this.applySubjectListener();

      // Initial load
      this.module.trigger('subject-change', this.nav.find('li').first());
    }

    this.clearOldGraphData = function() {
      var $bar_1 = this.module.find('.bar-1');
      var $bar_2 = this.module.find('.bar-2');
      var $bar_3 = this.module.find('.bar-3');
      var $cn = this.module.find('.subject-content');

      // Removing unecessary classes
      $bar_1.attr('class', 'bar-1');
      $bar_2.attr('class', 'bar-2');
      $bar_3.attr('class', 'bar-3');
      $cn.empty();
    }

    this.applyNewGraphData = function(element) {
      data = this.gatherData(element);
      var $bar_1 = this.module.find('.bar-1');
      var $bar_2 = this.module.find('.bar-2');
      var $bar_3 = this.module.find('.bar-3');
      var $cn = this.module.find('.subject-content');

      var $preContent = $('<em>' + data.label + ' ::</em>')

      $bar_1.addClass('filled-' + data.bar_1);
      $bar_2.addClass('filled-' + data.bar_2);
      $bar_3.addClass('filled-' + data.bar_3);
      $cn.html(data.content).prepend($preContent);
      $cn.wrapInner('<p></p>');
    }

    this.applySubjectListener = function() {
      t = this;
      this.module.on('subject-change', function(e, listItem) {
        t.clearOldGraphData();
        t.applyNewGraphData(listItem);
      })
    }

    this.applyNavListener = function() {
      t = this;
      this.nav.on('click', 'a', function(e) {
        e.preventDefault();
        t.nav.find('a').removeClass('is-active');
        $(this).toggleClass('is-active');

        t.module.trigger('subject-change', $(this).closest('li'));
      })
    }

    this.gatherData = function(listItem) {
      return $(listItem).data('subject');
    }
  };

  FormHandler = function() {

    this.renderMessage = function(html) {
      $('section.feedback-container').html(html);
    }

    this.disableSubmitButton = function() {
      this.submitButton.prop('disabled', true);
    }

    this.enableSubmitButton = function() {
      this.submitButton.prop('disabled', false);
    }

    this.updateSubmitButtonText = function(newText) {
      if(this.submitButton.is('input')){
        this.submitButton.val(newText);
      } else if (this.submitButton.is('button')) {
        this.submitButton.text(newText);
      } else {
        console.warn('Unknown submit button type.');
      }
    }

    this.appenIconTo = function(element, icon) {
      element.append(icon);
    }

    this.ajaxSubmission = function(url, data) {
      var that = this;
      var button = this.submitButton;
      var text = button.text();
      var icon = button.find('i');

      var req = $.ajax({
        type:     'POST',
        url:      url,
        data:     data,
        dataType: 'html',
        beforeSend: function() {
          that.disableSubmitButton();
          that.updateSubmitButtonText('Sending e-mail..');
        }
      });

      req.done(function(response, status, xhr){
        var content = $(response).find('section.feedback-container').html();
        that.renderMessage(content);
      });

      req.fail(function(response) {
        console.warn('Ajax request failed.');
        console.log(response);
        var $ajaxError = $('<p class="negative-text">I\'m terribly sorry but the message could not be sent, please be patient as I fix the problem.</p>');
        that.renderMessage($ajaxError);
      });

      req.always(function() {
        that.enableSubmitButton();
        that.updateSubmitButtonText(text);
        that.appenIconTo(that.submitButton, icon);
      });
    }

    this.init = function(selector) {
      var that = this;

      this.el = $(selector);
      this.submitButton = this.el.find('.form-cta');

      // Apply light form security
      this.el.find('#name').closest('section').hide();

      // Attach listeners
      this.el.on('submit', function(e) {
        e.preventDefault();
        that.ajaxSubmission($(this).attr('action'), $(this).serialize());
      });
    }
  };

  /*
    TODO:
    - All years affected by an article should be highlighted
    - Write tests for this Timeline
  */
  Timeline = function(selector) {
    this.init = function() {
      this.$timeLine = $(selector);
      this.$articles = this.$timeLine.find('article');
      this.applyListeners();
      this.selectDefault();
    };

    this.selectDefault = function() {
      this.$articles.first().trigger('click');
    };

    this.applyListeners = function() {
      var that = this;

      this.$articles.on('click', function() {
        that.hideArticles();
        that.showArticle($(this));
        that.deActivateYears();
        that.activateYear($(this).closest('li'));
      });
    };

    this.showArticle = function($el) {
      $el.removeClass('is-idle is-faded').addClass('is-showing');
    };

    this.hideArticles = function() {
      this.$articles.addClass('is-idle is-faded').removeClass('is-showing');
    };

    this.activateYear = function($li) {
      $li.addClass('is-active');
    };

    this.deActivateYears = function() {
      this.$timeLine.find('.timeline-list > li').removeClass('is-active');
    };
  };

  var magnImageHandler = new Magnific('image', '.viewable-image');
  magnImageHandler.init();

  var xpGraphModule = new ExperienceGraph('.xp-graph');
  xpGraphModule.init();

  var contactForm = new FormHandler();
  contactForm.init('.contact-form');

  var timeLine = new Timeline('.timeline');
  timeLine.init();

})(jQuery);
