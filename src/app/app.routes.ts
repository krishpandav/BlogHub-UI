import { Routes } from '@angular/router';
import { RegisterComponent } from './components/register/register.component';
import { childRoutes } from './routes/routes';
import { LayoutComponent } from './common/components/layout/layout.component';
import { LoginComponent } from './components/login/login.component';
import { CreateBlogComponent } from './components/create-blog/create-blog.component';
import { MyProfileComponent } from './components/my-profile/my-profile.component';
import { BlogEditComponent } from './components/blog-edit/blog-edit.component';
import { AdminComponent } from './components/admin/admin.component';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'create-blog', component: CreateBlogComponent },
  { path: 'blog-edit/:id', component: BlogEditComponent },
  { path: 'profile', component: MyProfileComponent },
  { path: 'admin', component: AdminComponent },
  { path: '', component: LayoutComponent, children: childRoutes },
];
