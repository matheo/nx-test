import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import {
  DisplayDatePipe,
  UiAvatar,
  UiInfoHint,
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

  protected readonly pageSizeOptions: readonly UiSelectOption<PageSize>[] =
    PAGE_SIZES.map((size) => ({ label: String(size), value: size }));

  ngOnInit(): void {
    this.store.load();
  }

  protected onPageSizeChange(size: PageSize | undefined): void {
    if (size) {
      this.store.pageSize.set(size);
    }
  }
}
