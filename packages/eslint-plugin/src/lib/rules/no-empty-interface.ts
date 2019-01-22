/**
 * @fileoverview Disallows the declaration of empty interfaces.
 * @author Patricio Trevino
 */

import { Rule } from 'eslint';
import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow the declaration of empty interfaces',
      extraDescription: [util.tslintRule('no-empty-interface')],
      category: 'TypeScript',
      url: util.metaDocsUrl('no-empty-interface'),
      recommended: 'error'
    },
    schema: []
  },

  //----------------------------------------------------------------------
  // Public
  //----------------------------------------------------------------------

  create(context: Rule.RuleContext) {
    return {
      TSInterfaceDeclaration(node) {
        if (node.body.body.length !== 0) {
          return;
        }
        let message;
        if (!node.extends || node.extends.length === 0) {
          message = 'An empty interface is equivalent to `{}`.';
        } else if (node.extends.length === 1) {
          message =
            'An interface declaring no members is equivalent to its supertype.';
        }
        if (!message) {
          return;
        }
        context.report({
          node: node.id,
          message
        });
      }
    };
  }
};
export = rule;
