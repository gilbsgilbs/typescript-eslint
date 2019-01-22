/**
 * @fileoverview Prevent TypeScript-specific variables being falsely marked as unused
 * @author James Henry
 */

import { Rule } from 'eslint';
import baseRule from 'eslint/lib/rules/no-unused-vars';
import { Identifier } from 'estree';
import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule: Rule.RuleModule = Object.assign({}, baseRule, {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unused variables',
      extraDescription: [util.tslintRule('no-unused-variable')],
      category: 'Variables',
      url: util.metaDocsUrl('no-unused-vars'),
      recommended: 'warn'
    },
    schema: baseRule.meta.schema,
    messages: baseRule.meta.messages
  },

  create(context: Rule.RuleContext) {
    const rules = baseRule.create(context);

    /**
     * Mark this function parameter as used
     * @param node The node currently being traversed
     */
    function markThisParameterAsUsed(node: Identifier): void {
      if (node.name) {
        const variable = context
          .getScope()
          .variables.find(scopeVar => scopeVar.name === node.name);

        if (variable) {
          variable.eslintUsed = true;
        }
      }
    }

    /**
     * Mark heritage clause as used
     * @param node The node currently being traversed
     */
    function markHeritageAsUsed(node): void {
      switch (node.type) {
        case 'Identifier':
          context.markVariableAsUsed(node.name);
          break;
        case 'MemberExpression':
          markHeritageAsUsed(node.object);
          break;
        case 'CallExpression':
          markHeritageAsUsed(node.callee);
          break;
      }
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------
    return Object.assign({}, rules, {
      "FunctionDeclaration Identifier[name='this']": markThisParameterAsUsed,
      "FunctionExpression Identifier[name='this']": markThisParameterAsUsed,
      'TSTypeReference Identifier'(node) {
        context.markVariableAsUsed(node.name);
      },
      TSInterfaceHeritage(node) {
        if (node.expression) {
          markHeritageAsUsed(node.expression);
        }
      },
      TSClassImplements(node) {
        if (node.expression) {
          markHeritageAsUsed(node.expression);
        }
      },
      'TSParameterProperty Identifier'(node) {
        // just assume parameter properties are used
        context.markVariableAsUsed(node.name);
      },
      'TSEnumMember Identifier'(node) {
        context.markVariableAsUsed(node.name);
      },
      '*[declare=true] Identifier'(node) {
        context.markVariableAsUsed(node.name);
      }
    });
  }
});
export = rule;
