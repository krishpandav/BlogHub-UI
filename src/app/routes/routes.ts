import { Routes } from '@angular/router';
import { BlogListComponent } from '../common/components/blog-list/blog-list.component';
import { PopularBlogsComponent } from '../components/popular/popular.component';
import { BlogDetailComponent } from '../components/blog-detail/blog-detail.component';
import { ProfileComponent } from '../components/profile/profile.component';
import { MyProfileComponent } from '../components/my-profile/my-profile.component';
import { MyBlogsComponent } from '../components/my-blogs/my-blogs.component';
import { CreateBlogComponent } from '../components/create-blog/create-blog.component';

export const childRoutes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: BlogListComponent },
    { path: 'popular', component: PopularBlogsComponent },
    { path: 'categories/:slug', component: BlogListComponent },
    { path: 'blog/:id', component: BlogDetailComponent },
    { path: 'profile/:id', component: ProfileComponent },
    { path: 'profile', component: MyProfileComponent },
    { path: 'my-blogs', component: MyBlogsComponent },
    { path: '*', redirectTo: '/home', pathMatch: 'full' },
];
