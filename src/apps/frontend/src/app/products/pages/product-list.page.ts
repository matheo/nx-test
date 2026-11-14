import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  DisplayDatePipe,
  UiAvatar,
  UiInfoHint,
  UiPagination,
  UiSearchInput,
  UiSelect,
  UiSelectOption,
  UiTableCard,
} from '@bank/ui';
import {
  PAGE_SIZES,
  PageSize,
  ProductListStore,
} from '../state/product-list.store';

@Component({
  selector: 'app-product-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DisplayDatePipe,
    UiAvatar,
    UiInfoHint,
    UiPagination,
    UiSearchInput,
    UiSelect,
    UiTableCard,
  ],
  providers: [ProductListStore],
  templateUrl: './product-list.page.html',
  styleUrl: './product-list.page.scss',
})
export class ProductListPage implements OnInit {
  protected readonly store = inject(ProductListStore);
  private readonly router = inject(Router);

  /** Bound from the `?search=` query param (withComponentInputBinding). */
  readonly search = input<string | undefined>();

  protected readonly pageSizeOptions: readonly UiSelectOption<PageSize>[] =
    PAGE_SIZES.map((size) => ({ label: String(size), value: size }));

  constructor() {
    effect(() => this.store.query.set(this.search() ?? ''));
  }

  ngOnInit(): void {
    this.store.load();
  }

  protected onSearchChange(term: string): void {
    this.router.navigate([], {
      queryParams: { search: term.trim() ? term : null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected onPageSizeChange(size: PageSize | undefined): void {
    if (size) {
      this.store.pageSize.set(size);
    }
  }
}
