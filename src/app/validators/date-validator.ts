import { ValidatorFn, AbstractControl } from "@angular/forms";

export function DateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        const SelectedDate = new Date(control.value);
        if(SelectedDate) console.log('SelectedDate',SelectedDate);
        
        // const min = new Date();
        // const max = new Date();
        const today = new Date(); // Current date and time
        const min = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // Start of today
        const max = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()); // End of one month from today
        console.log('inside the datevalidator', min);

        max.setMonth(min.getMonth() + 1);

        if (SelectedDate < min) {
            return { dateIsGone: true }
        } else if (SelectedDate > max) {
            return { dateIsExceded: true }
        }
        return null
    }
}