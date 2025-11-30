// src/app/register/register.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../common/service/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  registerForm: FormGroup;

  loading = false;
  errorMessage = '';
  successMessage = '';
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {

    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      fullname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const pass = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return pass === confirm ? null : { passwordMismatch: true };
  }


  onSubmit() {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';


    if (this.registerForm.valid) {
      console.log('Form Submitted:', this.registerForm.value);

      if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
        this.errorMessage = 'Passwords do not match.';
        this.loading = false;
        return;
      }

      const data = {
        username: this.registerForm.value.username,
        fullname: this.registerForm.value.fullname,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
      }

      this.authService.register(data).subscribe({
        next: (res) => {
          console.log('Registered successfully:', res)
          this.loading = false;
          this.successMessage = res.message || 'Registration successful!';
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (err) => {
          console.error('Registration failed:', err)
          this.errorMessage = err.message || 'Registration failed. Please try again.';
        }
      });
      this.loading = false;
    } else {
      this.errorMessage = this.getFormValidationErrors();
      this.loading = false;
    }
  }

  getFormValidationErrors(): string {
    const messages: string[] = [];

    const controls = this.registerForm.controls;

    // Username
    if (controls['username'].errors) {
      if (controls['username'].errors['required'])
        messages.push('Username is required.');
    }

    // Full Name
    if (controls['fullname'].errors) {
      if (controls['fullname'].errors['required'])
        messages.push('Full name is required.');
    }

    // Email
    if (controls['email'].errors) {
      if (controls['email'].errors['required'])
        messages.push('Email is required.');
      if (controls['email'].errors['email'])
        messages.push('Invalid email format.');
    }

    // Password
    if (controls['password'].errors) {
      if (controls['password'].errors['required'])
        messages.push('Password is required.');
      if (controls['password'].errors['minlength'])
        messages.push(
          `Password must be at least ${controls['password'].errors['minlength'].requiredLength} characters.`
        );
    }

    // Confirm Password
    if (controls['confirmPassword'].errors) {
      if (controls['confirmPassword'].errors['required'])
        messages.push('Confirm password is required.');
    }

    return messages.join(' ');
  }

}