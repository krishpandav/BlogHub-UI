// src/app/register/register.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../common/service/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;

  loading = false;
  errorMessage = '';
  successMessage = '';
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberme: ['', Validators.nullValidator]
    });
  }

  onSubmit() {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    debugger

    if (this.loginForm.valid) {
      console.log('Form Submitted:', this.loginForm.value);

      const data = {
        username: this.loginForm.value.username,
        password: this.loginForm.value.password,
      }



      const rememberMe = this.loginForm.value.rememberme || false;
      this.authService.login(data, rememberMe).subscribe({
        next: (res) => {
          this.loading = false;
          if (res.success) {
            this.successMessage = res.message || 'Registration successful!';
            setTimeout(() => this.router.navigate(['/home']), 2000);
          } else {
            this.errorMessage = res.message || 'Registration failed. Please try again.';
          }
          console.log('Registered successfully:', res)
        },
        error: (err) => {
          this.loading = false;
          console.error('Registration failed:', err)
          this.errorMessage = err?.error?.message || 'Login failed. Please try again.';
        }
      });
    }
  }
}
