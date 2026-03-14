/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Pipe, PipeTransform } from '@angular/core';
import { Constants } from '../constants/constants';

@Pipe({
  name: 'valueJson',
})
export class ValueJsonPipe implements PipeTransform {
  transform(fields: string[], object: object): string {
    let value = String();
    if (!object || !fields) return value;
    let newObject: object = JSON.parse(JSON.stringify(object));
    const newFields: string[] = JSON.parse(JSON.stringify(fields));
    if (!!newObject && !!newFields && Array.isArray(newFields) && newFields.length > Constants.zero) {
      let field = newFields.shift();
      while (!!field && !!newObject) {
        // @ts-ignore
        const val = newObject[field];
        if (typeof val !== 'object') {
          value = val || val === Constants.zero ? val.toString() : String();
          break;
        } else {
          field = newFields.shift();
          newObject = val;
        }
      }
    }

    return value;
  }
}
