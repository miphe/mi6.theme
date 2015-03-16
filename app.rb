
module Nesta
  class App

    use Rack::Static, :urls => ["/mi6.theme"], :root => "themes/mi6.theme/public"

    configure do
      sass_options = Hash.new

      # Making the generated css easier to read and debug
      sass_options[:line_numbers] = true
      set :sass, sass_options
      set :scss, sass_options
    end

    configure :development do
      enable :logging, :dump_errors
      set :raise_errors, true
    end

    helpers do

      def has_mailer?
        Nesta::Config.fetch('mailer', nil) ? true : false
      end

      def author_info
        Nesta::Config.fetch('author', nil) ? Nesta::Config.fetch('author') : {}
      end

      def social_info
        Nesta::Config.fetch('owner', nil) ? Nesta::Config.fetch('owner') : {}
      end

      def layout
        _header = if Nesta::Config.fetch('layout', nil)
          Nesta::Config.fetch('layout')['header']
        else
          'front-large'
        end

        { :header => _header }
      end

      def youtubeVideo(id, effectuation = 'full')
        'todo, write this helper'
      end

      def on_section(href, klass = 'is-active')
        if href.is_a?(Array)
          href.any? { |link| /\A(\/){0,1}#{link}(\/|$){1}/.match(request.path_info) } ? klass : nil
        else
          /\A(\/){0,1}#{href}(\/|$){1}/.match(request.path_info) ? klass : nil
        end
      end

      def a_link(opt)
        if opt.has_key?(:href) && opt.has_key?(:text)
          haml_tag :a, opt[:text], :class => opt[:class], :id => opt[:id], :href => opt[:href]
        else
          haml_tag :p, 'There was a problem returning your link', :class => 'is-error'
        end
      end

      def showcase_item(article)
        unless article.metadata('thumbnail') && article.metadata('link text') && article.metadata('description')
          haml_tag :p, 'There was a problem rendering the showcase item', :class => 'subtle-text'
          haml_tag :p, 'No Thumbnail', :class => 'is-error' unless article.metadata('thumbnail')
          haml_tag :p, 'No Link Text', :class => 'is-error' unless article.metadata('link text')
          haml_tag :p, 'No summary', :class => 'is-error' unless article.metadata('description')
        end

        haml_tag :div, :class => 'showcase-item' do
          haml_tag :a, :class => 'showcase-item-gfx', :href => article.abspath do
            haml_tag :img, :src => article.metadata('thumbnail'), :alt => article.metadata('link text')
          end
          haml_tag :div, :class => 'showcase-item-content' do
            haml_tag :h3 do
              haml_tag :a, article.metadata('link text'), :href => article.abspath
            end
            haml_tag :p, article.metadata('description')
          end
        end
      end

      def showcase_in_grid(items)
        haml_tag :div, :class => 'column-grid columns-2' do

          haml_tag :div, :class => 'column-1' do
            items.each_with_index do |itm, index|
              if index % 2 == 0
                showcase_item(itm)
              end
            end
          end

          haml_tag :div, :class => 'column-2' do
            items.each_with_index do |itm, index|
              if index % 2 != 0
                showcase_item(itm)
              end
            end
          end

        end
      end

      def list_articles(articles)
        haml_tag :ol, :class => 'bare' do
          articles.each do |article|
            haml_tag :li do
              haml_tag :i, :class => 'fa fa-file-text-o'
              haml_tag :a, article.heading, :href => url(article.abspath)
            end
          end
        end
      end

      def article_years
        articles = Page.find_articles
        last, first = articles[0].date.year, articles[-1].date.year
        (first..last).to_a.reverse
      end

      def archive_by_year
        article_years.each do |year|
          haml_tag :li, :class => 'box' do
            haml_tag :h3, year
            articles = Page.find_articles.select { |a| a.date.year == year }
            list_articles(articles)
          end
        end
      end

      def age(dob)
        now = Time.now.utc.to_date
        now.year - dob.year - ((now.month > dob.month || (now.month == dob.month && now.day >= dob.day)) ? 0 : 1)
      end

      # No slashes in path.
      def find_articles_by_path(path, count = nil)
        a = Nesta::Page.find_articles.select { |article| /^(\/#{path}\/).*/.match(article.abspath) }

        unless count.nil?
          a = a[0..count-1]
        end

        a
      end
    end # end helpers

    before do

      @scripts = {
        :libs => [
          '//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min.js',
          '/mi6.theme/js/modernizr.custom.js'
        ],
        :plugins => [
          '/mi6.theme/js/jquery.magnific-popup-0.9.9-min.js'
        ],
        :apps => [
          '/mi6.theme/js/main.js'
        ]
      }

    end

    before '/articles' do
      @articles_from_path = find_articles_by_path('articles')
    end

    # Sets up Jasmine test suite
    get '/js-tests' do
      haml :spec_runner, :layout => :test_layout
    end

    post '/contact' do
      settings = Nesta::Config.fetch('mailer', nil) ? Nesta::Config.fetch('mailer') : nil

      params = Hash.new
      request.params.map { |o,t| params[o.to_sym] = t }
      result = validate_all params
      result[:success_message] = 'Thanks, your message was sent. I\'ll get back to you as soon as possbile.'

      if settings && result[:success]
        Pony.mail({
          :subject     => settings["subject"],
          :body        => request.params["message"],
          :reply_to    => request.params["reply_to"],
          :to          => settings["to"],
          :via         => settings["via"].to_sym,
          :via_options => {
            :address              => settings["via_options"]["address"],
            :port                 => settings["via_options"]["port"],
            :enable_starttls_auto => settings["via_options"]["enable_starttls_auto"],
            :user_name            => settings["via_options"]["user_name"],
            :password             => settings["via_options"]["pw"],
            :authentication       => settings["via_options"]["authentication"]
          }
        })
      end

      haml :contact, :layout => !request.xhr?, :locals => result
    end

    # Some very basic form validation for the contact form.
    def validate_all(obj)
      validated_fields = Array.new

      obj.each do |field, value|
        validated_fields << validate_field(field, value)
      end

      errors = validated_fields.find_all { |item| item[:status] != 'OK' }

      return {
        :success => errors.empty?,
        :errors => errors
      }
    end

    def validate_field(field, value)
      # Honeypot
      expected = 'http://yourwebsite.com'

      case field
      when :reply_to
        res = validate_not_empty(field, value) || validate_email(field, value)
      when :message
        res = validate_not_empty(field, value) || validate_plaintext(field, value)
      when :name
        validate_empty(field, value)
      when :website
        validate_particular(field, value, expected)
      end
    end

    def validate_not_empty(field, str)
      str.empty? ? { :field => field.to_s, :status => 'FAIL', :message => 'Please make sure you dind\'t leave any fields empty.' } : nil
    end

    def validate_particular(field, str, expected)
      not_ok_particular = { :field => field.to_s, :status => 'FAIL', :message => 'Seems you have encountered an obscure problem while submitting your form.' }
      is_ok_particular = { :field => field.to_s, :status => 'OK' }
      str === expected ? is_ok_particular : not_ok_particular
    end

    def validate_empty(field, str)
      not_ok_empty = { :field => field.to_s, :status => 'FAIL', :message => 'Seems you have encountered an obscure problem while submitting your form.' }
      is_ok_empty = { :field => field.to_s, :status => 'OK' }
      str.empty? ? is_ok_empty : not_ok_empty
    end

    def validate_plaintext(field, str)
      not_ok_message = { :field => field.to_s, :status => 'FAIL', :message => 'Did you forget to write a message? Don\'t worry it happens to the best of us, why don\'t you try again?' }
      is_ok_message = { :field => field.to_s, :status => 'OK' }
      /^.{5,}$/.match(str) ? is_ok_message : not_ok_message
    end

    def validate_email(field, str)
      not_ok_email = { :field => field.to_s, :status => 'FAIL', :message => 'There seems to be a problem with your e-mail address, please make sure you entered a valid e-mail.' }
      is_ok_email = { :field => field.to_s, :status => 'OK' }
      /^\b[a-zA-Z._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.match(str) ? is_ok_email : not_ok_email
    end

  end
end
