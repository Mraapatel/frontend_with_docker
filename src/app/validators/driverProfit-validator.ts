import { AbstractControl, ValidatorFn } from '@angular/forms';

export function percentageRange(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;

    // Check if the value is present and a valid number
    if (value === null || value === undefined || isNaN(value)) {
      return { 'invalidNumber': true };
    }

    // Check if the value is between 1 and 100
    if (value < 1 || value > 100) {
      return { 'outOfRange': true };
    }

    // Check if there is only one decimal point
    const decimalCount = (value.toString().match(/\./g) || []).length;
    if (decimalCount > 1) {
      return { 'multipleDecimalPoints': true };
    }

    return null; // Return null if validation passes
  };
}

// export function PriceValidator(): ValidatorFn {
//   return (control: AbstractControl): { [key: string]: any } | null => {
//     const value = control.value;

//     // Check if the value is present and a valid number
//     if (value === null || value === undefined || isNaN(value)) {
//       return { 'invalidNumber': true };
//     }   

//     // Check if there is only one decimal point
//     const decimalCount = (value.toString().match(/\./g) || []).length;
//     if (decimalCount > 1) {
//       return { 'multipleDecimalPoints': true };
//     }

//     return null; // Return null if validation passes
//   };
// }
