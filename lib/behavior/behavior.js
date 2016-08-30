import { Behavior } from 'meteor/jagi:astronomy';
import methods from './methods';

Behavior.create({
  name: 'sort',
  options: {
    orderFieldName: 'order',
    hasRootField: false,
    rootFieldName: 'root'
  },
  createClassDefinition() {
    const behavior = this;
    const definition = {
      fields: {},
      methods: methods
    };

    definition.fields[this.options.orderFieldName] = {
      type: Number,
      default: 0
    };

    if (this.options.hasRootField) {
      definition.fields[this.options.rootFieldName] = {
        type: String,
        optional: true,
        default: null
      };
    }

    return definition;
  },
  apply(Class) {
    Class.extend(this.createClassDefinition(), ['fields', 'methods']);
  },
});
