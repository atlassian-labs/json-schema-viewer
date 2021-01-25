import { walkInternal } from "./json-schema-walker";
import { JsonSchema } from "./schema";

describe('JSON Schema Walker', () => {
  it('should not call the callback on a boolean', () => {
    walkInternal(true, () => {
      throw new Error('should not have been called')
    });
  });

  it('should call the root object', () => {
    walkInternal({ type: 'string' }, schema => {
      expect(schema).toEqual({ type: 'string' });
    });
  });

  it('should return the root reference', () => {
    walkInternal({ type: 'string' }, (_schema, internalRef) => {
      expect(internalRef).toEqual('#');
    });
  });

  it('should recurse the definitions', () => {
    const schema: JsonSchema = {
      definitions: {
        'one': { type: 'string' },
        'two': { type: 'number' }
      }
    };

    walkInternal(schema, (child, internalRef) => {
      switch(internalRef) {
        case '#':
          break;

        case '#/definitions/one':
          expect(child).toEqual({ type: 'string' });
          break;

        case '#/definitions/two':
          expect(child).toEqual({ type: 'number' });
          break;

        default:
          throw new Error(`Unknown reference: ${internalRef}`);
      }
    })
  });
});