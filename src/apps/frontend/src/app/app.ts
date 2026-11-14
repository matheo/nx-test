import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UiHeader } from '@bank/ui';

@Component({
  imports: [RouterModule, UiHeader],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
