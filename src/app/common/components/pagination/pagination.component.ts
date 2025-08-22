import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class PaginationComponent {
  @Input() currentPage = 1;
  @Input() totalPages = 1; // default
  @Output() pageChange = new EventEmitter<number>();

  goToPage(page: number) {
    if (page > 0 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }
}
