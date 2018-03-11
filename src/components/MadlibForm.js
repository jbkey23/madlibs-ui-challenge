var React = require('react');
// We're going to use this open source forms library to create our
// madlib form
var t = require('tcomb-form');
var { Form } = t.form;

var MadlibForm = React.createClass({
  // this is the function that renders the form. most of the HTML
  // is generated by the forms library, so you're pretty much stuck to
  // how they format it.
  getDefaultProps: function() {
    return {
      requireError: 'oops, you missed this one',
      endingWithLyError: 'this one has to end with "ly"'
    };
  },
  render: function() {
    return (
      <div className='madlib-form'>
        <h1 className="page-title">Flocabulary Madlib</h1>
        <h2 className='prompt'>Fill out the form below to create your madlib</h2>
        <p className="hint">Hover to start.</p>
        <form onSubmit={this.onSubmit}>
          <Form
            ref="form"
            onChange={this.onChange}
            value={this.state.value}
            type={this.state.type}
            options={this.state.options}
          />
          {
            Object.keys(this.state.value).filter(key => this.state.value[key]).length === Object.keys(this.state.inputs).length
            ? (
                <button
                  className="submit-button"
                  type="submit"
                >
                  Make your madlib
                </button>
              )
            : null
          }
        </form>
      </div>
    );
  },
  // you probably shouldn't have to touch any of the other functions
  // on this class
  getInitialState: function() {
    var inputs = {};
    var result;

    t.String.getValidationErrorMessage = (value, path) => {
      if (!value) {
        return this.props.requireError;
      }
      if (path[0] === 'wordEndingWithLy' && !value.endsWith('ly')) {
        return this.props.endingWithLyError;
      }
    }

    var blankRegexp = /%&(.*?)&%/gi;
    while (result = blankRegexp.exec(this.props.text)) {
      var fieldType;
      if (result[1] === 'wordEndingWithLy') {
        fieldType = t.refinement(t.String, s => s.endsWith('ly'));
      } else if (result[1] === 'number') {
        fieldType = t.Number;
      } else {
        fieldType = t.String;
      }

      inputs[result[1]] = fieldType;
    }

    return {
      type: t.struct(inputs),
      options: {
        fields: {
          number: {
            type: 'number'
          }
        }
      },
      value: {},
      submitted: false,
      inputs: inputs,
    };
  },

  componentDidMount: function() {
    $('.madlib-form input').focus(e => {
      $('.has-focus').removeClass('has-focus');

      var formGroup = $(e.target).parent();
      formGroup.addClass('has-focus');
      formGroup.removeClass('not-touched');
      formGroup.addClass('touched');
    });

    $('.madlib-form .form-group').addClass('not-touched');

    $('.madlib-form').hover(() => {
      $('.madlib-form').addClass('form-showing');
    });

    setTimeout(() => {
      $('.hint').addClass('show-hint');
    }, 3000);
  },

  onSubmit: function(event) {
    event.preventDefault();
    if (this.formsAreValid()) {
      this.props.onSubmit(this.getFormValues());
    }
  },
  onChange: function(value, path) {
    this.setState(
      { value: value },
      () => {
        this.refs.form.getComponent(path).validate();
      }
    );
  },
  formsAreValid: function() {
    return !this.refs.form.validate().errors.length;
  },
  getFormValues: function() {
    return this.refs.form.getValue();
  }
});

module.exports = MadlibForm;
