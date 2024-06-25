import { Component, DestroyRef, ElementRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddCountryService } from '../../services/add-country.service';
import { catchError, of, tap } from 'rxjs';
import { Country, UserData, Card } from '../../models/models.interface';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {
  @ViewChild('inputValue') searchTag!: ElementRef;

  private _fb = inject(FormBuilder);
  private _addCountryService = inject(AddCountryService);
  private _userService = inject(UserService);
  private _tostr = inject(ToastrService);

  backendUrl = environment.BACKEND_URL
  userForm!: FormGroup;
  // userUpdateForm!: FormGroup;
  userFatched!: Array<UserData>;
  userFatchedlength!: number;
  CountryCodes: Array<{ countryId: string, countryCallingCode: string, country: string }> = [];
  formData = new FormData();
  update: boolean = false;
  selectedUser!: UserData;
  methodToggle: string = 'addNewUser';

  handler: any = null;
  tokenId!: string;
  customerCards!: Card[];
  selectedCardUser!: UserData;
  defaultCardId!: string;
  // ValidateImage: BehaviorSubject<boolean> = new BehaviorSubject(true);

  pageNumber: number = 1;
  totalUsers!: number;
  sortValue = 'none';
  searchTerm!: string;
  extensions: Array<string> = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'tif', 'webp', 'svg', 'avif']

  // validateImgeObj = {
  //   extentions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'tif', 'webp', 'svg', 'avif'],
  //   ValidateImage: this.ValidateImage
  // }

  ngOnInit(): void {
    this.loadStripe();
    this.userForm = this._fb.group({
      userProfile: ['', [Validators.required]],
      userName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      userEmail: ['', [Validators.required, Validators.email, Validators.minLength(4), Validators.maxLength(64)]],
      countryCallingCode: ['', Validators.required],
      userPhone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
    });

    this.getCountryCodes();
    this.getUsers();
  }

  getCountryCodes() {
    this._addCountryService.getCountry().pipe(
      tap((res) => {
        if ((res as Country[]).length > -1) {
          (res as Country[]).forEach(country => {
            this.CountryCodes.push({ countryId: country._id, countryCallingCode: country.countryCallingCode, country: country.country })
          });
          console.log(this.CountryCodes);
        }
      }),
      catchError((error) => {
        this._tostr.error("Enable to fatch country code", "Error");
        console.log('some error occured');
        return of(error)
      })
    ).subscribe()
  }

  getUsers() {
    let details = {
      page: this.pageNumber,
      sort: this.sortValue,
      searchTerm: this.searchTerm
    }
    this.fatchUsers(details);
  }

  onFileSelected(event: Event) {
    // const inputElement = event.target as HTMLInputElement;
    const file = (event.target as HTMLInputElement).files?.[0]; // Access files property directly
    console.log((event.target as HTMLInputElement).files![0]);

    if (file) {
      const mimeType = file.type.split('/').pop();
      console.log(mimeType);
      if (!mimeType || this.extensions.indexOf(mimeType) === -1) {
        this._tostr.warning(`${mimeType} type is not allowd`, 'Warning');
        this.userForm.get('userProfile')?.reset();
        return;
      }

      if (this.formData) { this.formData = new FormData() }
      this.formData.append('userProfile', file)
      // console.log(file);
    }
  }

  SelectedSortValue(value: string) {
    console.log(value);
    this.sortValue = value;
    if (this.totalUsers > 1) {
      let details = {
        page: this.pageNumber,
        sort: this.sortValue,
        searchTerm: this.searchTerm
      }
      this.fatchUsers(details);
    }

  }

  checkForm() {
    if (this.userForm.get('userName')?.value.trim() === '' || this.userForm.get('userEmail')?.value.trim() === '' || this.userForm.get('userPhone')?.value.trim() === '') {
      let dname = this.userForm.get('userName')?.value
      this.userForm.get('userName')?.setValue(dname.trim());
      this.userForm.markAllAsTouched();
      this._tostr.error('Please fill in all required fields.', 'Error');
      return false;
    }
    return true
  }

  onSubmit(): void {
    if (!this.userForm.valid) {
      this._tostr.error("Please enter valid fields", "Error");
      this.userForm.markAllAsTouched();
      return;
    }

    if (!this.checkForm()) return;

    // this.validateEmail();
    // this.validatePhone();
    if (!this.validateEmail() || !this.validatePhone()) {
      return;
    }

    this.formData.append('userName', this.userForm.get('userName')?.value.trim())
    this.formData.append('userEmail', this.userForm.get('userEmail')?.value.trim())
    this.formData.append('countryCallingCode', this.userForm.get('countryCallingCode')?.value)
    this.formData.append('userPhone', this.userForm.get('userPhone')?.value)
    console.log('yooooooooooo');
    console.log(this.userForm.value);

    this._userService.storeUser(this.formData).pipe(
      tap((res) => {
        console.log(res);
        if (this.userFatched.length > 0) {
          if (this.userFatched.length <= 1) {
            this.userFatched.push(res as UserData);
          } else {
            let details = {
              page: this.pageNumber,
              sort: this.sortValue,
              searchTerm: this.searchTerm
            }
            this.fatchUsers(details);
          }
        }
        this._tostr.success('User Added Successfully', 'Success');
        this.userForm.reset();
        this.formData = new FormData();
      }),
      catchError((error) => {
        // this.userForm.reset();
        if (error.status === 400) {
          // this.userForm.reset();
          if (error.error.error === 'Email already exists!') {
            this._tostr.warning('Email already exists', 'Warning');
          }
          else if (error.error.error === 'Phone number already exists!') {
            this._tostr.error('Phone number already exists!', 'Error');
            // this.userForm.reset();
          }
          else if (error.error.error === 'Request body not found') {
            this._tostr.error('Request body not found', 'Error');
            // this.userForm.reset();
          }
          else {
            console.log('Unknown validation error:', error.error.error);
            // this.userForm.reset();
          }
        } else {
          console.log('Unexpected error:', error);
          this._tostr.error('Some error Occured', 'Error');
          // this.userForm.reset();
        }
        this.formData.delete('userName');
        this.formData.delete('userEmail');
        this.formData.delete('countryCallingCode');
        this.formData.delete('userPhone');
        return of(error);
      })
    ).subscribe()
  }

  editClicked(user: UserData) {
    // this.ValidateImage.next(false);
    console.log(user);
    this.formData.delete('countryCallingCode');
    this.formData.append('countryCallingCode', user.countryCallingCode._id);

    this.methodToggle = 'updateUser'
    this.userForm.get('userProfile')?.clearValidators();
    this.userForm.get('userProfile')?.updateValueAndValidity();
    this.userForm.reset();
    this.selectedUser = user
    this.update = true;
    this.userForm.get('countryCallingCode')?.disable();
    this.userForm.patchValue({
      userName: user.userName,
      userPhone: user.userPhone,
      userEmail: user.userEmail,
      countryCallingCode: user.countryCallingCode._id
    });
  }
  cleanFormData() {
    this.formData.delete('userName');
    this.formData.delete('userEmail');
    // this.formData.delete('countryCallingCode');
    this.formData.delete('userPhone');
    this.formData.delete('id');
    // this.userForm.get('countryCallingCode')?.enable();

  }


  updateUser() {
    // console.log(this.userForm.get('userName')?.value.trim());
    if (!this.userForm.valid) {
      this._tostr.error("Please enter valid fields", "Error");
      return;
    }

    if (!this.checkForm()) return;

    this.cleanFormData()
    this.formData.append('userName', this.userForm.get('userName')?.value.trim());
    this.formData.append('userEmail', this.userForm.get('userEmail')?.value.trim());
    // this.formData.append('countryCallingCode', this.userForm.get('countryCallingCode')?.value)
    this.formData.append('userPhone', this.userForm.get('userPhone')?.value);
    // console.log(this.userForm.get('countryCallingCode')?.value);
    let emailvalidator = this.validateEmail();
    let phonevalidator = this.validatePhone();

    if (!this.validateEmail() || !this.validatePhone()) {
      return;
    }
    if (emailvalidator)
      this.formData.append('id', this.selectedUser._id);
    this._userService.updateUser(this.formData).pipe(
      tap((res) => {
        console.log(res);
        let index = this.userFatched.findIndex((user) => user._id === res._id);
        this.userFatched[index] = res as UserData;
        this._tostr.success('User Updated Successfully', 'Success');
        this.update = false;
        this.userForm.reset();
        this.formData = new FormData();
        this.userForm.get('countryCallingCode')?.enable();
        this.userForm.get('userProfile')?.setValidators([Validators.required]);
        this.userForm.get('userProfile')?.updateValueAndValidity();
        this.formData.delete('countryCallingCode');
        // this.ValidateImage.next(true);
      }),
      catchError((error) => {
        console.log(error);
        console.log('Unexpected error:', error);

        // this.userForm.get('countryCallingCode')?.enable();
        // this.ValidateImage.next(true);
        if (error.status === 400) {
          if (error.error.error === 'Email already exists!') {
            this._tostr.warning('Email already exists', 'Warning');
            this.cleanFormData();
            // this.userForm.reset(); this.update = false;
          } else if (error.error.error === 'Phone number already exists!') {
            this.cleanFormData();
            // this.formData.delete('countryCallingCode');
            this._tostr.warning('Phone number already exists', 'Warning');
            // this.userForm.reset(); this.update = false;
          } else {
            this.cleanFormData();
            // this.formData.delete('countryCallingCode');
            console.log('Unknown validation error:', error.error.error);
            // this.update = false;
          }
        } else {
          this.cleanFormData()
          console.log('Unexpected error:', error);
          this._tostr.error('Error Occured while updating user', 'error');
          // this.update = false;
        }
        // this.ValidateImage.next(true);
        return of(error);
      })
    ).subscribe()
  }

  deleteClicked(id: string) {
    let choice = confirm('Are you sure to delete this user');
    if (choice) {
      console.log(id);
      this._userService.deleteUser(id).subscribe((res) => {
        console.log(res);
        this.userForm.reset();
        let data = {
          page: this.pageNumber,
          sort: this.sortValue,
          searchTerm: this.searchTerm,
        }
        this.fatchUsers(data)
        let index = this.userFatched.findIndex((user) => user._id === res._id);
        this.userFatched.splice(index, 1);
        this._tostr.warning('User deleted successfully', 'Success');
      })
    }
  }

  previousBtn() {
    if (this.disablePrevBnt()) {
      this._tostr.warning("Can't perform this action ", "Warning");
      return;
    }
    this.pageNumber = this.pageNumber > 1 ? --this.pageNumber : 1
    console.log(this.pageNumber);
    let details = {
      page: this.pageNumber,
      sort: this.sortValue,
      searchTerm: this.searchTerm
    }
    this.fatchUsers(details)
  }

  nextBtn() {
    if (this.disableNextBnt() || this.userFatched.length == 0) {
      this._tostr.warning("Can't perform this action ", "Warning");
      return;
    }
    this.pageNumber = ++this.pageNumber
    console.log(this.pageNumber);
    let details = {
      page: this.pageNumber,
      sort: this.sortValue,
      searchTerm: this.searchTerm
    }
    this.fatchUsers(details);
  }
  get userProfile() {
    return this.userForm.get('userProfile');
  }

  get userName() {
    return this.userForm.get('userName');
  }

  get userEmail() {
    return this.userForm.get('userEmail');
  }

  get countryCallingCode() {
    return this.userForm.get('countryCode');
  }

  get userPhone() {
    return this.userForm.get('userPhone');
  }

  disablePrevBnt(): boolean {
    if (this.pageNumber == 1) {
      return true
    } else if (this.pageNumber == 0) {
      return true;
    }
    return false
  }

  disableNextBnt(): boolean {
    if (this.totalUsers == this.pageNumber * 2) {
      return true;
    } else if (this.totalUsers < this.pageNumber * 2) {
      return true;
    } else if (this.userFatched) {
      if (this.userFatched.length < 0) {
        return true;
      }
    } else if (this.pageNumber == 0) {
      return true;
    }
    return false
  }

  fatchUsers(data: object) {
    this._userService.getExistingUser(data)
      .subscribe((res) => {
        console.log('uuuuuuuuuuuuuuuuuuuuuuSuuuuuuuuuuuuuuuu');

        console.log('this is it', res);
        this.userFatched = res.users;
        console.log('uuuuuuuuuuuuuuuuuuuuuuSuuuuuuuuuuuuuuuu');
        this.totalUsers = res.totalUsers;
        if (this.userFatched) {
          if (this.userFatched.length > -1) {
            this.userFatchedlength = this.userFatched.length
          } else { this.userFatchedlength = -1 }
        }
      },
        (error) => {
          console.log('borrrrrrrrrrrrrrr', error);

          this._tostr.info('Showing main tabel  ', 'info');
          this._tostr.error('No User Found', 'Error');

          console.log(error.error.Message);
          this.searchTag.nativeElement.value = '';
          this.searchTerm = ''
          this.pageNumber = 1;
          this.disablePrevBnt();
          console.log(error.error.Message);
          this.disableNextBnt();
        });
  }

  clearAll() {
    this.formData = new FormData()
    this.userForm.reset();
    this.userForm.get('countryCallingCode')?.enable();
    this.update = this.update ? false : true
  }

  validateEmail(): boolean {
    const emailRegex = /^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,}$/;
    const userEmailValue = this.userForm.get('userEmail')?.value;
    if (!this.userForm.invalid && userEmailValue) {
      if (!emailRegex.test(userEmailValue)) {
        this._tostr.error('Invalid email address', 'Error');
        return false
      }
    }
    return true
  }

  validatePhone(): boolean {
    const phoneRegex = /^[1-9]\d{9}$/;
    const phoneValue = this.userForm.get('userPhone')?.value;
    if (!this.userForm.invalid && phoneValue) {
      if (!phoneRegex.test(phoneValue)) {
        this._tostr.error('Invalid phone number', 'Error');
        return false;
      }
    }
    return true
  }


  addCard() {
    let user = this.selectedCardUser;
    var handler = (<any>window).StripeCheckout.configure({
      key: 'pk_test_51PKFbURvggPBSsNZHM7EzVRAd0C41qQyAhsHDMyp8XxUdjXkZhjsLrkQN0YREobqcQfQOyQmuuIBHO94EHd2TGpc00kWQ3qOBF',
      locale: 'auto',
      token: (token: any) => {
        this.tokenId = token.id;
        console.log(this.tokenId);
        let details = {
          token: token.id,
          stripClientId: user.stripCustomerId,
          userId: user._id,
        };
        console.log('token' ,details);
        // return;
        
        this._userService.addCard(details).pipe(
          tap((res) => {
            this.customerCards.unshift(res);

            if (this.customerCards.length == 1) {
              this.getCards(user);
            }
          }),
          catchError((error) => {
            if (error.error.message == 'Enable to add Card') {
              this._tostr.error('Enable to add Card', 'Error');
            } else {
              this._tostr.error('Some error Occured while adding Card', 'Error');
            }
            console.log(error);

            return of(error)
          })
        ).subscribe();
      }
    }
    );

    handler.open({
      name: 'Add Card',
      // description: '2 widgets',
      // amount: amount * 100
    });
  }

  loadStripe() {

    if (!window.document.getElementById('stripe-script')) {
      var s = window.document.createElement("script");
      s.id = "stripe-script";
      s.type = "text/javascript";
      s.src = "https://checkout.stripe.com/checkout.js";
      s.onload = (o) => {
        this.handler = (<any>window).StripeCheckout.configure({
          key: 'pk_test_51PKFbURvggPBSsNZHM7EzVRAd0C41qQyAhsHDMyp8XxUdjXkZhjsLrkQN0YREobqcQfQOyQmuuIBHO94EHd2TGpc00kWQ3qOBF',
          locale: 'auto',
          token: function (token: any) {
            console.log(token)
            // alert('Payment Success!!');
          }
        });
      }
      window.document.body.appendChild(s);
    }
  }

  getCards(user: UserData) {
    this.selectedCardUser = user;
    this.customerCards = []
    console.log(user.stripCustomerId);
    this._userService.getCards(user.stripCustomerId).pipe(
      catchError((e) => {
        this._tostr.error('Error While Fetching cards', 'Error');
        return of(e)
      })
    ).subscribe((res) => {
      console.log(res);

      this.customerCards = res.cards;
      this.defaultCardId = res.defaultCardId;
    })
    //  this.getCardsFormServer(user);
  }

  onCardSelected(cardId: string) {
    console.log(this.selectedCardUser.stripCustomerId);

    console.log(cardId);
    let details = {
      customerId: this.selectedCardUser.stripCustomerId,
      cardId: cardId
    }
    this._userService.setDefaultCard(details).pipe(
      tap((res) => {
        this.defaultCardId = cardId
        console.log(res);
        this._tostr.success('Default Card Updated', 'Success');
      }),
      catchError((err) => {
        console.log('some error occured', err);
        return of(err)
      })
    ).subscribe();
  }

  deleteCard(card: Card) {
    let choice = confirm('Are you sure to delete this Card');
    if (!choice) return;
    console.log('here==========');

    let details = {
      customerId: this.selectedCardUser.stripCustomerId,
      cardId: card.cardId
    }

    console.log('delete card ===> ' , details);
    // return;
    
    this._userService.deleteCard(details).pipe(
      tap((res) => {
        this._tostr.success('Card Deleted', 'Success');
        let index = this.customerCards.findIndex((c) => c.cardId === card.cardId);
        this.customerCards.splice(index, 1);
        // this.updateDefaultCard(card);
        this._userService.getCards(this.selectedCardUser.stripCustomerId).subscribe((res) => {
          this.customerCards = res.cards;
          this.defaultCardId = res.defaultCardId;
        })
        // this.getCardsFormServer(this.selectedCardUser);
      }),
      catchError((error) => {
        this._tostr.error('Error Occured while deleting card');
        return of(error);
      })
    ).subscribe()
  }

  // updateDefaultCard(card: Card) {
  //   if (this.customerCards.length > -1) {
  //     if (this.defaultCardId === card.cardId) {
  //       let remainingcard = this.customerCards[this.customerCards.length - 1];
  //       console.log('');
  //       let details = {
  //         customerId: this.selectedCardUser.stripCustomerId,
  //         cardId: remainingcard.cardId
  //       }
  //       this._userService.setDefaultCard(details).pipe(
  //         tap((res) => {
  //           console.log(res);
  //           // this._userService.getCards(this.selectedCardUser.stripCustomerId).subscribe((res) => {
  //           //   this.customerCards = res.cards;
  //           //   this.defaultCardId = res.defaultCardId;
  //           // })
  //           this.getCardsFormServer(this.selectedCardUser)
  //           this._tostr.success('Default Card Updated', 'Success');
  //         }),
  //         catchError((err) => {
  //           console.log('some error occured', err);
  //           return of(err)
  //         })
  //       ).subscribe();

  //     }
  //   }
  // }

  getCardsFormServer(user: UserData) {
    this._userService.getCards(user.stripCustomerId).pipe(
      tap((res) => {
        this.customerCards = res.cards;
        this.defaultCardId = res.defaultCardId;
      }),
      catchError((error) => {
        this._tostr.error('Some Error Occured while fetching cards', 'Error');
        return of(error)
      })
    ).subscribe()
  }

  searchUsers(text: string) {
    if (text == '') {
      this._tostr.warning('Please Enter Some Values', 'Warning');
      this.searchTerm = ''
      return;
    }
    this.pageNumber = 1;
    console.log(text);
    this.searchTerm = text;
    this.sortValue = 'none';
    let details = {
      page: this.pageNumber,
      sort: this.sortValue,
      searchTerm: this.searchTerm
    }

    this.fatchUsers(details);
  }
}
