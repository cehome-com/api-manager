;(function ($, window, document, undefined) {
    var chosenSelect = function (options) {
        var options = this.options = $.extend({}, chosenSelect.defaults, options);
        var jq = this.jq = ('string' == typeof options.selector) ? $(options.selector) : options.selector;
        jq.css('width', options.width).css('height', 'calc(2.0rem)').css('font-size', '0.80rem');
        if(options.url){
            this.load(options.params);
        } else {
            this.data(options.data);
        }

        // 添加change事件
        options.change && jq.on('change', function (event) {
            options.change(event);
        })
    };

    chosenSelect.prototype = {
        data: function (data) {
            var jq = this.jq, options = this.options;
            if(options.blank){
                jq.append($('<option value=""></option>').text(options.emptyText));
            }
            $.each(data, function (index, value) {
                jq.append($('<option></option>').attr('value', value[options.optionField.value]).text(value[options.optionField.text]));
            });
            if(options.selectedVal){
                this.val(options.selectedVal);
            }
            return this;
        },
        val: function (value) {
            var jq = this.jq;
            if (!value) {
                return jq.val();
            } else {
                jq.find('option').each(function () {
                    var $option = $(this);
                    if ($option.val() == value) {
                        $option.attr('selected', true);
                        return false;
                    }
                });
            }
        },
        doChange: function () {
            var jq = this.jq.trigger('change');
            return this;
        },
        selected: function () {
            var selected = {};
            this.jq.find('option').each(function () {
                var $selectedOption = $(this);
                if ($selectedOption.attr('selected')) {
                    selected['value'] = $selectedOption.val();
                    selected['text'] = $selectedOption.text();
                    return false;
                }
            });
            return selected;
        },
        clear: function () {
            this.jq.empty();
        },
        disable: function () {
            this.jq.attr('disabled', true).css('background-color', 'white');
            return this;
        },
        enable: function () {
            this.jq.attr('disabled', false);
            return this;
        },
        _cache: {},
        load: function (param) {
            var chosenSelect = this, options = this.options, url = options.url, cache = options.cache;
            if(cache){
                var key = $.md5(JSON.stringify(param) + ':' + url);
                if(this._cache[key]){
                    chosenSelect.data(this._cache[key]);
                    return this;
                }
            }
            $.ajax({
                url: url,
                type: 'GET',
                async: options.async,
                data: param,
                dataType: 'json',
                success: function (result) {
                    var data = result.data;
                    if(cache){
                        chosenSelect._cache[key] = data;
                    }
                    chosenSelect.data(data);
                }
            });
            return this;
        }
    };

    chosenSelect.defaults = {
        selector: '',
        url: '',
        async: true,
        data: {},
        width: '100%',
        height: '100%',
        blank: true,
        emptyText: '--请选择--',
        selectedVal: undefined,
        params: {},
        cache: false,
        change: function (event) {

        }
    };

    api.ui.chosenSelect = function (options) {
        return new chosenSelect(options);
    };
})(jQuery, window, document);