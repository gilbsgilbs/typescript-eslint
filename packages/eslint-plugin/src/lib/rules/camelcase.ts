/**
 * @fileoverview Rule to flag non-camelcased identifiers
 * @author Patricio Trevino
 */

import { Rule } from 'eslint';
import baseRule from 'eslint/lib/rules/camelcase';
import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
const defaultOptions = [
  {
    allow: ['^UNSAFE_'],
    ignoreDestructuring: false,
    properties: 'never'
  }
];

/* eslint-disable eslint-plugin/require-meta-type */
const rule: Rule.RuleModule = {
  meta: Object.assign({}, baseRule.meta, {
    docs: {
      description: 'Enforce camelCase naming convention',
      url: util.metaDocsUrl('ban-types'),
      recommended: 'error'
    }
  }),

  create(context: Rule.RuleContext) {
    const rules = baseRule.create(context);
    const TS_PROPERTY_TYPES = [
      'TSPropertySignature',
      'ClassProperty',
      'TSParameterProperty',
      'TSAbstractClassProperty'
    ];

    const options = util.applyDefault(defaultOptions, context.options)[0];
    const properties = options.properties;
    const allow = options.allow;

    /**
     * Checks if a string contains an underscore and isn't all upper-case
     * @param  name The string to check.
     */
    function isUnderscored(name: string): boolean {
      // if there's an underscore, it might be A_CONSTANT, which is okay
      return name.indexOf('_') > -1 && name !== name.toUpperCase();
    }

    /**
     * Checks if a string match the ignore list
     * @param name The string to check.
     * @returns if the string is ignored
     * @private
     */
    function isAllowed(name: string): boolean {
      return (
        allow.findIndex(
          entry => name === entry || name.match(new RegExp(entry)) !== null
        ) !== -1
      );
    }

    /**
     * Checks if the the node is a valid TypeScript property type.
     * @param {Node} node the node to be validated.
     * @returns true if the node is a TypeScript property type.
     * @private
     */
    function isTSPropertyType(node): boolean {
      if (!node.parent) return false;
      if (TS_PROPERTY_TYPES.includes(node.parent.type)) return true;

      if (node.parent.type === 'AssignmentPattern') {
        return (
          node.parent.parent &&
          TS_PROPERTY_TYPES.includes(node.parent.parent.type)
        );
      }

      return false;
    }

    return {
      Identifier(node) {
        /*
         * Leading and trailing underscores are commonly used to flag
         * private/protected identifiers, strip them
         */
        const name = node.name.replace(/^_+|_+$/g, '');

        // First, we ignore the node if it match the ignore list
        if (isAllowed(name)) {
          return;
        }

        // Check TypeScript specific nodes
        if (isTSPropertyType(node)) {
          if (properties === 'always' && isUnderscored(name)) {
            context.report({
              node,
              messageId: 'notCamelCase',
              data: { name: node.name }
            });
          }

          return;
        }

        // Let the base rule deal with the rest
        // eslint-disable-next-line new-cap
        rules.Identifier!(node);
      }
    };
  }
};
export = rule;
