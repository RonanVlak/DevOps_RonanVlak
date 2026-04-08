import { Component, signal, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule], // Nodig voor lijstjes en input velden
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/users'; 

  protected readonly title = signal('DevOps User Management');
  users = signal<any[]>([]);
  newUserName = signal('');

  ngOnInit() {
    this.fetchUsers();
  }

  // Haal de lijst op uit Database A via de API
  fetchUsers() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => this.users.set(data),
      error: (err) => console.error('Kon gebruikers niet laden:', err)
    });
  }

  // Voeg gebruiker toe (triggert de RabbitMQ flow naar de Worker)
  addUser() {
    const naam = this.newUserName().trim();
    if (!naam) return;

    this.http.post(this.apiUrl, { naam }).subscribe({
      next: () => {
        this.newUserName.set(''); // Reset input
        this.fetchUsers();        // Ververs de lijst
      },
      error: (err) => console.error('Fout bij toevoegen:', err)
    });
  }
}