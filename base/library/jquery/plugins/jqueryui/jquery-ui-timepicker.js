﻿/*
 * jQuery timepicker addon
 * By: Trent Richardson [http://trentrichardson.com]
 * Version 0.5
 * Last Modified: 6/16/2010
 * 
 * Copyright 2010 Trent Richardson
 * Dual licensed under the MIT and GPL licenses.
 * http://trentrichardson.com/Impromptu/GPL-LICENSE.txt
 * http://trentrichardson.com/Impromptu/MIT-LICENSE.txt
 * 
 * HERES THE CSS:
 * #ui-timepicker-div dl{ text-align: left; }
 * #ui-timepicker-div dl dt{ height: 25px; }
 * #ui-timepicker-div dl dd{ margin: -25px 0 10px 65px; }
 */
(function($) {
	function Timepicker() {
	}
	Timepicker.prototype = {
		$input : null,
		$timeObj : null,
		inst : null,
		hour_slider : null,
		minute_slider : null,
		second_slider : null,
		hour : 0,
		minute : 0,
		second : 0,
		ampm : '',
		formattedDate : '',
		formattedTime : '',
		formattedDateTime : '',
		defaults : {
			holdDatepickerOpen : true,
			showButtonPanel : true,
			timeOnly : false,
			showHour : true,
			showMinute : true,
			showSecond : false,
			showTime : true,
			stepHour : .05,
			stepMinute : .05,
			stepSecond : .05,
			ampm : false,
			hour : 0,
			minute : 0,
			second : 0,
			timeFormat : 'hh:mm tt',
			alwaysSetTime : true
		},
		addTimePicker : function(dp_inst) {
			var tp_inst = this;
			var currDT = this.$input.val();
			var regstr = this.defaults.timeFormat.toString().replace(
					/h{1,2}/ig, '(\\d?\\d)').replace(/m{1,2}/ig, '(\\d?\\d)')
					.replace(/s{1,2}/ig, '(\\d?\\d)').replace(/t{1,2}/ig,
							'(am|pm|a|p)?').replace(/\s/g, '\\s?') + '$';
			if (!this.defaults.timeOnly) {
				regstr = '\\S{' + this.defaults.timeFormat.length + ',}\\s+'
						+ regstr;
			}
			var order = this.getFormatPositions();
			var treg = currDT.match(new RegExp(regstr, 'i'));
			if (treg) {
				if (order.t !== -1)
					this.ampm = ((treg[order.t] == undefined || treg[order.t].length == 0) ? ''
							: (treg[order.t].charAt(0).toUpperCase() == 'A') ? 'AM'
									: 'PM').toUpperCase();
				if (order.h !== -1) {
					if (this.ampm == 'AM' && treg[order.h] == '12')
						this.hour = 0;
					else if (this.ampm == 'PM' && treg[order.h] != '12')
						this.hour = (parseFloat(treg[order.h]) + 12).toFixed(0);
					else
						this.hour = treg[order.h];
				}
				if (order.m !== -1)
					this.minute = treg[order.m];
				if (order.s !== -1)
					this.second = treg[order.s];
			}
			tp_inst.timeDefined = (treg) ? true : false;
			setTimeout(function() {
				tp_inst.injectTimePicker(dp_inst, tp_inst);
			}, 10);
		},
		getFormatPositions : function() {
			var finds = this.defaults.timeFormat.toLowerCase().match(
					/(h{1,2}|m{1,2}|s{1,2}|t{1,2})/g);
			var orders = {
				h : -1,
				m : -1,
				s : -1,
				t : -1
			};
			if (finds) {
				for ( var i = 0; i < finds.length; i++) {
					if (orders[finds[i].toString().charAt(0)] == -1)
						orders[finds[i].toString().charAt(0)] = i + 1;
				}
			}
			return orders;
		},
		injectTimePicker : function(dp_inst, tp_inst) {
			var $dp = $('#' + $.datepicker._mainDivId);
			var hourMax = 23 - (23 % tp_inst.defaults.stepHour);
			var minMax = 59 - (59 % tp_inst.defaults.stepMinute);
			var secMax = 59 - (59 % tp_inst.defaults.stepSecond);
			if ($dp.find("div#ui-timepicker-div").length == 0) {
				var html = '<div id="ui-timepicker-div">'
						+ '<dl>'
						+ '<dt id="ui_tpicker_time_label"'
						+ ((tp_inst.defaults.showTime) ? ''
								: ' style="display:none;"')
						+ '>时间</dt>'
						+ '<dd id="ui_tpicker_time"'
						+ ((tp_inst.defaults.showTime) ? ''
								: ' style="display:none;"')
						+ '></dd>'
						+ '<dt id="ui_tpicker_hour_label"'
						+ ((tp_inst.defaults.showHour) ? ''
								: ' style="display:none;"')
						+ '>时</dt>'
						+ '<dd id="ui_tpicker_hour"'
						+ ((tp_inst.defaults.showHour) ? ''
								: ' style="display:none;"')
						+ '></dd>'
						+ '<dt id="ui_tpicker_minute_label"'
						+ ((tp_inst.defaults.showMinute) ? ''
								: ' style="display:none;"')
						+ '>分</dt>'
						+ '<dd id="ui_tpicker_minute"'
						+ ((tp_inst.defaults.showMinute) ? ''
								: ' style="display:none;"')
						+ '></dd>'
						+ '<dt id="ui_tpicker_second_label"'
						+ ((tp_inst.defaults.showSecond) ? ''
								: ' style="display:none;"')
						+ '>秒</dt>'
						+ '<dd id="ui_tpicker_second"'
						+ ((tp_inst.defaults.showSecond) ? ''
								: ' style="display:none;"') + '></dd>'
						+ '</dl>' + '</div>';
				$tp = $(html);
				if (tp_inst.defaults.timeOnly == true) {
					$tp
							.prepend('<div class="ui-widget-header ui-helper-clearfix ui-corner-all"><div class="ui-datepicker-title">Choose Time</div></div>');
					$dp
							.find(
									'.ui-datepicker-header, .ui-datepicker-calendar, .ui-datepicker-current')
							.hide();
				}
				tp_inst.hour_slider = $tp.find('#ui_tpicker_hour').slider(
						{
							orientation : "horizontal",
							value : tp_inst.hour,
							min : 0,
							max : hourMax,
							step : tp_inst.defaults.stepHour,
							slide : function(event, ui) {
								tp_inst.hour_slider.slider("option", "value",
										ui.value);
								tp_inst.onTimeChange(dp_inst, tp_inst);
							}
						});
				tp_inst.minute_slider = $tp.find('#ui_tpicker_minute').slider(
						{
							orientation : "horizontal",
							value : tp_inst.minute,
							min : 0,
							max : minMax,
							step : tp_inst.defaults.stepMinute,
							slide : function(event, ui) {
								tp_inst.minute_slider.slider("option", "value",
										ui.value);
								tp_inst.onTimeChange(dp_inst, tp_inst);
							}
						});
				tp_inst.second_slider = $tp.find('#ui_tpicker_second').slider(
						{
							orientation : "horizontal",
							value : tp_inst.second,
							min : 0,
							max : secMax,
							step : tp_inst.defaults.stepSecond,
							slide : function(event, ui) {
								tp_inst.second_slider.slider("option", "value",
										ui.value);
								tp_inst.onTimeChange(dp_inst, tp_inst);
							}
						});
				$dp.find('.ui-datepicker-calendar').after($tp);
				tp_inst.$timeObj = $('#ui_tpicker_time');
				if (dp_inst != null) {
					var timeDefined = tp_inst.timeDefined;
					tp_inst.onTimeChange(dp_inst, tp_inst);
					tp_inst.timeDefined = timeDefined;
				}
			}
		},
		onTimeChange : function(dp_inst, tp_inst) {
			var hour = tp_inst.hour_slider.slider('value');
			var minute = tp_inst.minute_slider.slider('value');
			var second = tp_inst.second_slider.slider('value');
			var ampm = (tp_inst.hour < 12) ? 'AM' : 'PM';
			var hasChanged = false;
			if (tp_inst.hour != hour || tp_inst.minute != minute
					|| tp_inst.second != second
					|| (tp_inst.ampm.length > 0 && tp_inst.ampm != ampm))
				hasChanged = true;
			tp_inst.hour = parseFloat(hour).toFixed(0);
			tp_inst.minute = parseFloat(minute).toFixed(0);
			tp_inst.second = parseFloat(second).toFixed(0);
			tp_inst.ampm = ampm;
			tp_inst.formatTime(tp_inst);
			tp_inst.$timeObj.text(tp_inst.formattedTime);
			if (hasChanged) {
				tp_inst.updateDateTime(dp_inst, tp_inst);
				tp_inst.timeDefined = true;
			}
		},
		formatTime : function(inst) {
			var tmptime = inst.defaults.timeFormat.toString();
			var hour12 = ((inst.ampm == 'AM') ? (inst.hour) : (inst.hour % 12));
			hour12 = (hour12 == 0) ? 12 : hour12;
			if (inst.defaults.ampm == true) {
				tmptime = tmptime.toString().replace(/hh/g,
						((hour12 < 10) ? '0' : '') + hour12).replace(/h/g,
						hour12).replace(/mm/g,
						((inst.minute < 10) ? '0' : '') + inst.minute).replace(
						/m/g, inst.minute).replace(/ss/g,
						((inst.second < 10) ? '0' : '') + inst.second).replace(
						/s/g, inst.second).replace(/TT/g,
						inst.ampm.toUpperCase()).replace(/tt/g,
						inst.ampm.toLowerCase()).replace(/T/g,
						inst.ampm.charAt(0).toUpperCase()).replace(/t/g,
						inst.ampm.charAt(0).toLowerCase());
			} else {
				tmptime = tmptime.toString().replace(/hh/g,
						((inst.hour < 10) ? '0' : '') + inst.hour).replace(
						/h/g, inst.hour).replace(/mm/g,
						((inst.minute < 10) ? '0' : '') + inst.minute).replace(
						/m/g, inst.minute).replace(/ss/g,
						((inst.second < 10) ? '0' : '') + inst.second).replace(
						/s/g, inst.second);
				tmptime = $.trim(tmptime.replace(/t/gi, ''));
			}
			inst.formattedTime = tmptime;
			return inst.formattedTime;
		},
		updateDateTime : function(dp_inst, tp_inst) {
			var dt = this.$input.datepicker('getDate');
			if (dt == null)
				this.formattedDate = $.datepicker.formatDate($.datepicker._get(
						dp_inst, 'dateFormat'), new Date(), $.datepicker
						._getFormatConfig(dp_inst));
			else
				this.formattedDate = $.datepicker.formatDate($.datepicker._get(
						dp_inst, 'dateFormat'), dt, $.datepicker
						._getFormatConfig(dp_inst));
			if (this.defaults.alwaysSetTime) {
				this.formattedDateTime = this.formattedDate + ' '
						+ this.formattedTime;
			} else {
				if (dt == null || !tp_inst.timeDefined
						|| tp_inst.timeDefined == false) {
					this.formattedDateTime = this.formattedDate;
				} else {
					this.formattedDateTime = this.formattedDate + ' '
							+ this.formattedTime;
				}
			}
			if (this.defaults.timeOnly == true)
				this.$input.val(this.formattedTime);
			else
				this.$input.val(this.formattedDateTime);
		}
	};
	jQuery.fn.datetimepicker = function(o) {
		var tp = new Timepicker();
		if (o == undefined)
			o = {};
		tp.defaults = $.extend( {}, tp.defaults, o);
		tp.defaults = $.extend( {}, tp.defaults, {
			beforeShow : function(input, inst) {
				tp.hour = tp.defaults.hour;
				tp.minute = tp.defaults.minute;
				tp.second = tp.defaults.second;
				tp.ampm = '';
				tp.$input = $(input);
				tp.inst = inst;
				tp.addTimePicker(inst);
				if ($.isFunction(o['beforeShow']))
					o.beforeShow(input, inst);
			},
			onChangeMonthYear : function(year, month, inst) {
				tp.updateDateTime(inst, tp);
				if ($.isFunction(o['onChangeMonthYear']))
					o.onChangeMonthYear(year, month, inst);
			},
			onClose : function(dateText, inst) {
				tp.updateDateTime(inst, tp);
				if ($.isFunction(o['onClose']))
					o.onClose(dateText, inst);
			}
		});
		$(this).datepicker(tp.defaults);
	};
	jQuery.fn.timepicker = function(o) {
		o = $.extend(o, {
			timeOnly : true
		});
		$(this).datetimepicker(o);
	};
	$.datepicker._selectDate = function(id, dateStr) {
		var target = $(id);
		var inst = this._getInst(target[0]);
		var holdDatepickerOpen = (this._get(inst, 'holdDatepickerOpen') === true) ? true
				: false;
		dateStr = (dateStr != null ? dateStr : this._formatDate(inst));
		if (inst.input)
			inst.input.val(dateStr);
		this._updateAlternate(inst);
		var onSelect = this._get(inst, 'onSelect');
		if (onSelect)
			onSelect.apply((inst.input ? inst.input[0] : null),
					[ dateStr, inst ]);
		else if (inst.input)
			inst.input.trigger('change');
		if (inst.inline)
			this._updateDatepicker(inst);
		else if (holdDatepickerOpen) {
		} else {
			this._hideDatepicker();
			this._lastInput = inst.input[0];
			if (typeof (inst.input[0]) != 'object')
				inst.input.focus();
			this._lastInput = null;
		}
		this._notifyChange(inst);
	};
	$.datepicker._base_updateDatepicker = $.datepicker._updateDatepicker;
	$.datepicker._updateDatepicker = function(inst) {
		this._base_updateDatepicker(inst);
		this._beforeShow(inst.input, inst);
	};
	$.datepicker._beforeShow = function(input, inst) {
		var beforeShow = this._get(inst, 'beforeShow');
		if (beforeShow)
			beforeShow.apply((inst.input ? inst.input[0] : null), [ inst.input,
					inst ]);
	};
	$.datepicker._doKeyPress = function(event) {
		var inst = $.datepicker._getInst(event.target);
		if ($.datepicker._get(inst, 'constrainInput')) {
			var dateChars = $.datepicker._possibleChars($.datepicker._get(inst,
					'dateFormat'));
			var chr = String
					.fromCharCode(event.charCode == undefined ? event.keyCode
							: event.charCode);
			return event.ctrlKey
					|| (chr < ' ' || !dateChars || dateChars.indexOf(chr) > -1
							|| event.keyCode == 58 || event.keyCode == 32);
		}
	};
})(jQuery);
