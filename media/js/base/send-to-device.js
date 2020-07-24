/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* globals Spinner */

// create namespace
if (typeof window.Mozilla === 'undefined') {
    window.Mozilla = {};
}

(function($) {
    'use strict';

    var SendToDevice = function(id) {

        this.formId = typeof id !== 'undefined' ? id : 'send-to-device';

        this.formLoaded = false;
        this.formTimeout = null;
        this.smsEnabled = false;

        this.$widget = document.getElementById(this.formId);
        this.$form = document.querySelector('.send-to-device-form');
        this.$formFields = document.querySelector('.send-to-device-form-fields');
        this.$input = document.querySelector('.send-to-device-input');
        this.$thankyou = document.querySelector('.thank-you');
        this.$errorList = document.querySelector('.error-list');
        this.$spinnerTarget = document.querySelector('.loading-spinner');
        this.$footerLinks = document.querySelector('footer > ul');

        // Does not exist in test file
        //this.$sendAnotherLink = document.querySelector('.send-another');
        this.$formHeading = document.querySelector('.form-heading');

        this.spinnerColor = this.$widget.dataset.spinnerColor || '#000';
        this.countries = this.$widget.dataset.countries;
        console.log(this.countries);

        this.spinner = new Spinner({
            lines: 12, // The number of lines to draw
            length: 4, // The length of each line
            width: 2, // The line thickness
            radius: 4, // The radius of the inner circle
            corners: 0, // Corner roundness (0..1)
            rotate: 0, // The rotation offset
            direction: 1, // 1: clockwise, -1: counterclockwise
            color: this.spinnerColor, // #rgb or #rrggbb or array of colors
            speed: 1, // Rounds per second
            trail: 60, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: true // Whether to use hardware acceleration
        });
    };

    // static value for user country code
    SendToDevice.COUNTRY_CODE = '';

    SendToDevice.prototype.geoCallback; // jshint ignore:line

    /**
     * Initialise the form messaging and bind events.
     */
    SendToDevice.prototype.init = function() {
        if (this.$widget instanceof HTMLElement) {
            this.getLocation();
            this.bindEvents();
        }
    };

    /**
     * Gets the country code of the location of the user
     * using bedrock's /country-code.json service
     */
    SendToDevice.prototype.getLocation = function() {
        var self = this;

        // if a dev has added ?geo=<country code> to the URL
        // we can skip the geo lookup and act as if it worked
        if (window.location.search.indexOf('geo=') !== -1) {
            var urlRe = /geo=([a-z]{2})/i;
            var match = urlRe.exec(window.location.search);
            if (match) {
                SendToDevice.COUNTRY_CODE = match[1].toLowerCase();
                self.updateMessaging();
                if (typeof self.geoCallback === 'function') {
                    self.geoCallback(SendToDevice.COUNTRY_CODE);
                }
                return;
            }
        }

        // should /country-code.json be slow to load,
        // just show the email messaging after 5 seconds waiting.
        console.log('timeout call');
        this.formTimeout = setTimeout(self.updateMessaging, 5000);

        console.log('fetch call');
        window.fetch('/country-code.json')
            .then(function(data) {
                console.log('then begin');
                
                if (data && data.country_code) {
                    SendToDevice.COUNTRY_CODE = data.country_code.toLowerCase();
                }
                self.updateMessaging();
                console.log('then end');
            })
            .catch(function(x) {
                // something went wrong, show only the email messaging.
                console.log('catch begin');
                self.updateMessaging();
                console.log('catch end');
            })
            .then(function() {
                console.log('finally begin');
                if (typeof self.geoCallback === 'function') {
                    self.geoCallback(SendToDevice.COUNTRY_CODE);
                }
                console.log('finally end');
            });
    };

    /**
     * Returns boolean indication whether or not the user is in a supported country
     */
    SendToDevice.prototype.inSupportedCountry = function() {
        var ccode = SendToDevice.COUNTRY_CODE;
        console.log('Country code:' + SendToDevice.COUNTRY_CODE);
        return (ccode && this.countries.indexOf('|' + ccode + '|') !== -1);
    };

    /**
     * Checks to update the form messaging based on the users location
     */
    SendToDevice.prototype.updateMessaging = function() {
        console.log('updateMessaging start');
        clearTimeout(this.formTimeout);
        if (!this.formLoaded) {
            this.formLoaded = true;

            // if the page visitor is in a supportec country, show the SMS messaging / copy
            if (this.inSupportedCountry()) {
                this.showSMS();
            }
        }
        console.log('updateMessaging end');
    };

    /**
     * Updates the form fields to include SMS messaging
     */
    SendToDevice.prototype.showSMS = function() {
        console.log('showSMS begin');
        // TODO: label doesnt have any data, and original selector used class instead
        // of id
        var $label = this.$formFields.querySelector('#form-input-label');
        this.$form.classList.add('sms-country');

        // TODO: remove this?
        $label.innerHTML = $label.dataset.alt;
        this.$input.setAttribute('placeholder', this.$input.dataset.alt);
        this.smsEnabled = true;
        console.log('showSMS end');
    };

    /**
     * Binds form submission and click events
     */
    SendToDevice.prototype.bindEvents = function() {
        console.log('bindEvents begin');
        // this.$form.on('submit', $.proxy(this.onFormSubmit, this));
        this.$form.addEventListener('submit', this.onFormSubmit.bind(this));

        // TODO: test file does not have this
        // this.$sendAnotherLink.addEventListener('click', this.sendAnother.bind(this));
        console.log('bindEvents end');
    };

    /**
     * Remove all form event handlers
     */
    SendToDevice.prototype.unbindEvents = function() {
        // TODO: ask about removeEventListener
        // this.$form.off('submit');
        // this.$form.removeEventListener('submit');
        // this.$footerLinks.off('click');
        // this.$footerLinks.removeEventListener('click');
        // this.$sendAnotherLink.off('click');
        // this.$sendAnotherLink.removeEventListener('click');
    };

    /**
     * Show the form again to send another link
     */
    SendToDevice.prototype.sendAnother = function(e) {
        e.preventDefault();
        // this.$input.val('');
        this.$input.value = '';
        // this.$errorList.addClass('hidden');
        this.$errorList.classList.add('hidden');
        // this.$thankyou.addClass('hidden');
        this.$thankyou.classList.add('hidden');
        // this.$formHeading.removeClass('hidden');
        this.$formHeading.classList.remove('hidden');
        // this.$formFields.removeClass('hidden');
        this.$formFields.classList.remove('hidden');
        // this.$input.trigger('focus');
        this.$input.dispatchEvent('focus');
    };

    /**
     * Enable form fields and hide loading indicator
     */
    SendToDevice.prototype.enableForm = function() {
        // this.$input.prop('disabled', false);
        this.$input.disabled = false;
        // this.$form.removeClass('loading');
        this.$form.classList.remove('loading');
        // this.$spinnerTarget.hide();
        this.$spinnerTarget.style.display = 'none';
    };

    /**
     * Disable form fields and show loading indicator
     */
    SendToDevice.prototype.disableForm = function() {
        // this.$input.prop('disabled', true);
        this.$input.disabled = true;
        // this.$form.addClass('loading');
        this.$form.classList.add('loading');

        this.spinner.spin(this.$spinnerTarget.show()[0]);
    };

    /**
     * Reallly primative validation (e.g a@a)
     * matches built-in validation in Firefox
     * @param {email}
     */
    SendToDevice.prototype.checkEmailValidity = function(email) {
        return /\S+@\S+/.test(email);
    };

    /**
     * Handle form submission via XHR
     */
    SendToDevice.prototype.onFormSubmit = function(e) {
        e.preventDefault();

        var self = this;
        var action = this.$form.getAttribute('action');
        var formData = this.$form.serialize();

        this.disableForm();

        // if we know the user has not been prompted to enter an SMS number,
        // perform some basic email validation before submitting the form.
        if (!this.smsEnabled && !this.checkEmailValidity(this.$input.val())) {
            this.onFormError(['email']);
            return;
        }

        if (SendToDevice.COUNTRY_CODE) {
            formData += '&country=' + SendToDevice.COUNTRY_CODE;
        }

        // else POST and let the server work out whether the input is a
        // valid email address or US phone number.
        // $.post(action, formData)
        //     .done(function(data) {
        //         if (data.success) {
        //             self.onFormSuccess(data.success);
        //         } else if (data.errors) {
        //             self.onFormError(data.errors);
        //         }
        //     })
        //     .fail(function(error) {
        //         self.onFormFailure(error);
        //     });

        window.fetch(action, {
            method: 'POST',
            body: JSON.stringify(formData),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        // }).then(
            // (data) => { return data.json();
        }).then(function(data) {
            data = data.json();
                if (data.success) {
                    self.onFormSuccess(data.success);
                } else if (data.errors) {
                    self.onFormError(data.errors);
                }
        }).catch(function(error) {
                self.onFormFailure(error);
        });


    };

    SendToDevice.prototype.onFormSuccess = function() {
        // this.$errorList.addClass('hidden');
        this.$errorList.classList.add('hidden');
        // this.$formFields.addClass('hidden');
        this.$formFields.classList.add('hidden');
        // this.$formHeading.addClass('hidden');
        this.$formHeading.classList.add('hidden');
        // this.$thankyou.removeClass('hidden');
        this.$thankyou.classList.remove('hidden');
        this.enableForm();

        // track signup type in GA
        var isEmail = this.checkEmailValidity(this.$input.value);

        window.dataLayer.push({
            'event': 'send-to-device-success',
            'input': isEmail ? 'email-address' : 'phone-number'
        });
    };

    SendToDevice.prototype.onFormError = function(errors) {
        var errorClass;
        // this.$errorList.find('li').hide();
        this.$errorList.querySelectorAll('li')
            .forEach(function(li){
                    li.style.display = 'none';
        });

        this.$errorList.classList.remove('hidden');

        // if ($.inArray('platform', errors) !== -1) {
        if (errors.indexOf('platform') !== -1) {
            errorClass = '.system';
        // } else if (this.smsEnabled && $.inArray('number', errors) !== -1) {
        } else if (this.smsEnabled && errors.indexOf('number') !== -1) {
            errorClass = '.sms';
        } else {
            errorClass = '.email';
        }

        // this.$errorList.find(errorClass).show();
        this.$errorList.querySelectorAll(errorClass)
            .forEach(function(eClass){
                eClass.style.display = '';
        });
        this.enableForm();
    };

    SendToDevice.prototype.onFormFailure = function() {
        // this.$errorList.find('li').hide();
        this.$errorList.querySelectorAll('li')
            .forEach(function(li){
                    li.style.display = 'none';
        });
        this.$errorList.classList.remove('hidden');
        // this.$errorList.find('.system').show();
        this.$errorList.querySelectorAll('.system')
            .forEach(function(sysEle){
                    sysEle.style.display = '';
        });
        this.enableForm();
    };

    window.Mozilla.SendToDevice = SendToDevice;

})();
// })(window.jQuery);
