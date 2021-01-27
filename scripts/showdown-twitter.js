/**
 * Twitter Extension
 * Support for twitter @username and hashtag
 * Usage:
 * @username   ->  <a href="http://twitter.com/username">@username</a>
 * #hashtag    ->  <a href="http://twitter.com/search/%23hashtag">#hashtag</a>
 */
(function (extension) {
  'use strict';

  if (typeof showdown !== 'undefined') {
    // global (browser or nodejs global)
    extension(showdown);
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define(['showdown'], extension);
  } else if (typeof exports === 'object') {
    // Node, CommonJS-like
    module.exports = extension(require('showdown'));
  } else {
    // showdown was not found so we throw
    throw Error('Could not find showdown library');
  }

}(function (showdown) {
  'use strict';

  showdown.extension('twitter', function () {
    return [
      // @username syntax
      {
        type:    'lang',
        regex:   '\\B(\\\\)?@([\\S]+)\\b',
        replace: function (match, leadingSlash, username) {
          // Check if we matched the leading \ and return nothing changed if so
          if (leadingSlash === '\\') {
            return match;
          } else {
            return '<a href="http://twitter.com/' + username + '">@' + username + '</a>';
          }
        }
      },

      // #hashtag syntax
      {
        type:    'lang',
        regex:   '\\B(\\\\)?#([\\S]+)\\b',
        replace: function (match, leadingSlash, tag) {
          // Check if we matched the leading \ and return nothing changed if so
          if (leadingSlash === '\\') {
            return match;
          } else {
            return '<a href="http://twitter.com/search/%23' + tag + '">#' + tag + '</a>';
          }
        }
      },

      // Escaped @'s
      {
        type:    'lang',
        regex:   '\\\\@',
        replace: '@'
      }
    ];
  });
}));
