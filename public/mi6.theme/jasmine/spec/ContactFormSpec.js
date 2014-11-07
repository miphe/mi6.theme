describe("ContactForm", function() {

  jasmine.getFixtures().fixturesPath = '/mi6.theme/jasmine/fixtures';

  beforeEach(function() {
    loadFixtures('ContactForm.html');
    fh = new FormHandler();
    fh.init('.contact-form');
    $btn = fh.el.find('[type=submit]');
  });

  it("should render honeypot properly", function() {
    expect(fh.el.find('#name').closest('section')).toBeHidden();
    expect(fh.el.find('#website')).toHaveValue('http://yourwebsite.com');
  });

  it("should render error message", function() {
    var html = '<p>There is no spoon.</p>';
    fh.renderMessage(html);
    expect(fh.el.find('.feedback-container').html()).toBe(html);
  });

  it("should disable/enable submit button", function() {
    expect($btn).toHaveProp('disabled', false);
    fh.disableSubmitButton();
    expect($btn).toHaveProp('disabled', true);
    fh.enableSubmitButton();
    expect($btn).toHaveProp('disabled', false);
  });

  it("should update submit element's text and handle it's icon", function() {
    var newText = 'Hello Mr.Andersson';
    var $icon = $btn.find('i.fa');
    expect($icon).toExist();
    fh.updateSubmitButtonText(newText);
    expect($btn.text()).toBe(newText);
    fh.appenIconTo($btn, $icon);
    expect($btn.find('i')).toHaveClass('fa-paper-plane');
  });
});
