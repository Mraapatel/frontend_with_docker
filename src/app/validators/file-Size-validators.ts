import { AbstractControl, ValidatorFn } from "@angular/forms";
import { ValidateImageObj } from "../models/models.interface";

export function imageValidator(data: ValidateImageObj): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        if (data.ValidateImage.value) {
            const file = control.value;
            // console.log(data.ValidateImage.value);

            console.log(file);
            const extension = file.split('.').pop()?.toLowerCase();
            console.log(extension);


            if (!extension || data.extentions.indexOf(extension) === -1) {
                // File format is not allowed, return validation error
                console.log('brooo---------------');
                
                return { invalidFormat: true };
            }
            // if (file instanceof File) {
            //     //  const fileSize = file.size;
            //     //  const fileSizeInKB = Math.round(fileSize / 1024);
            //     const extension = file.name.split('.').pop()?.toLowerCase();
            //     console.log(extension);
            //     if (!extension || allowedFormats.indexOf(extension) === -1) {
            //         // File format is not allowed, return validation error
            //         return { invalidFormat: true };
            //       }

            // }
        } else {
            console.log('in else -----');

        }

        return null;
    };
}