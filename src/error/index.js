const ID = {
  'variable.not.defined': ['ReferenceError', ins => `${ins.variable} is not defined`],
  'function.not.defined': ['ReferenceError', ins => `${ins.name}(...) function is not defined`],
  'arithmetic.error': ['ArithmeticError', (ins, err) => 'Expression is not correct. ' + err.message]
}

class ExecutionError {

  constructor(script) {
    this.script = script
  }

  throw(ins, id, err) {
    let error
    let [code, msg] = ID[id]
    msg = msg(ins, err)
    if (ins._file) {
      let { line, column } = ins._file.start
      error = this.makeError(code, msg, {
        line,
        column
      })
    }
    else {
      error = new Error(msg);
    }
    throw error
  }

  syntax(err) {
    if (!err.location) {
      throw err
    }
    const { line, column } = err.location.start
    const error = this.makeError('syntax', 'Syntax Error', {
      line,
      column
    })
    throw error
  }

  makeError(code, message, options) {
    var line = options.line;
    var column = options.column;
    var filename = options.filename;
    var src = this.script || options.src;
    var fullMessage;
    var location = line + (column ? ':' + column : '');
    if (src && line >= 1 && line <= src.split('\n').length) {
      var lines = src.split('\n');
      var start = Math.max(line - 3, 0);
      var end = Math.min(lines.length, line + 3);
      // Error context
      var context = lines.slice(start, end).map(function (text, i) {
        var curr = i + start + 1;
        var preamble = (curr == line ? '  > ' : '    ')
          + curr
          + '| ';
        var out = preamble + text;
        if (curr === line && column > 0) {
          out += '\n';
          out += Array(preamble.length + column).join('-') + '^';
        }
        return out;
      }).join('\n');
      fullMessage = (filename || 'ConverseScript') + ':' + location + '\n\n' + context + '\n\n' + message
    } else {
      fullMessage = (filename || 'ConverseScript') + ':' + location + '\n\n' + message;
    }
    var err = new Error(fullMessage);
    err.code = 'ConverseScript:' + code;
    err.msg = message;
    err.line = line;
    err.column = column;
    err.filename = filename;
    return err;
  }
}

module.exports = ExecutionError