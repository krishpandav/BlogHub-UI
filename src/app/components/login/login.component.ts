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
      rememberme: ['', Validators.required]
    });
  }

  onSubmit() {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

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
          console.log('Registered successfully:', res)
          this.successMessage = res.message || 'Registration successful!';
          setTimeout(() => this.router.navigate(['/home']), 2000);
        },
        error: (err) => {
          this.loading = false;
          console.error('Registration failed:', err)
          this.successMessage = err.message || 'Registration failed. Please try again.';
        }
      });
    }
  }
}
