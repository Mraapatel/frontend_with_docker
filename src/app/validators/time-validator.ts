import { ValidatorFn, AbstractControl } from "@angular/forms";

export function TimeValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {

        const selectedTime = control.value;
        let otherControlValue = control.parent?.get('bookingDate')?.value;
        console.log(otherControlValue);

        if (otherControlValue === null) {
            return { selectDateFirst: true }
        }

        let time;
        const minTime = new Date(); // Current time
        // const hours = minTime.getHours();
        // const minutes = minTime.getMinutes();
        const choosedDate = new Date(otherControlValue);
        // console.log(choosedDate);
        // console.log(minTime);
        // console.log('hours and minutes', hours, minutes);
        // console.log(selectedTime);
        // console.log(typeof (selectedTime));
        if (minTime.getDate() === choosedDate.getDate()) {
            if (selectedTime) {
                time = selectedTime.split(':')
            }
            // console.log('Inside the TimeValidator', minTime);
            if (time) {
                if (minTime.getHours() > parseInt(time[0], 10)) {
                    // console.log('hours', hours);
                    // console.log('time[0]', parseInt(time[0], 10));
                    // console.log('inside the if condition');
                    // console.log('parse selecedtime', parseInt(selectedTime, 10));

                    return { timeIsBeforeNow: true };
                }
                if (minTime.getHours() == parseInt(time[0], 10) && minTime.getMinutes() + 1 > time[1]) {
                    return { timeIsBeforeNow: true };
                }
            }
        }
        return null;
    };
}