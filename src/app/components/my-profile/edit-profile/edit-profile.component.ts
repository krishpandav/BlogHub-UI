import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../../common/service/user.service';
import { AuthService } from '../../../common/service/auth.service';

@Component({
  selector: 'app-edit-profile',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss'
})
export class EditProfileComponent implements OnInit {
  @Input() data: any;
  profileForm: FormGroup;
  formError: string | null = null;
  formSubmitting = false;
  userInitial: string = 'U';

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      fullname: ['', Validators.required],
      // username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      bio: ['']
    });
  }

  ngOnInit(): void {
    console.log('-----------------------', this.data);
  }

  setFormValues(user: any): void {
    this.profileForm.patchValue({
      name: user.name || '',
      // username: user.username || '',
      email: user.email || '',
      bio: user.bio || ''
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.formSubmitting = true;
    this.formError = null;

    const updatedData = this.profileForm.value;
    this.userService.updateProfile(updatedData).subscribe({
      next: (response) => {
        this.authService.setAuthData(this.authService.getToken()!, response.data);
        // this.toastService.show('Profile updated successfully', 'success');
        this.formSubmitting = false;
        this.activeModal.close(response.data);
      },
      error: (err) => {
        this.formError = 'Failed to update profile: ' + err.message;
        // this.toastService.show('Failed to update profile', 'error');
        this.formSubmitting = false;
      }
    });
  }
}
