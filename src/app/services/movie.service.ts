import { Movie } from 'src/app/models/movie.model';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Observable, Subject, of } from 'rxjs';

import { Query } from './../models/query.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private omdbApiUrl = 'http://www.omdbapi.com/?i=tt3896198&apikey=3cc051ad';  // OMDb api URL
  private searchTerms = new Subject<Query>();
    
  constructor(private http: HttpClient) { }

  search(query: Query) {
    console.log(query);
    this.searchTerms.next(query);
  }

  getSearchList(): Observable<Movie[]> {

    return this.searchTerms.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),

      // ignore new term if same as previous term
      // distinctUntilChanged((a: Query, b: Query) => {console.log(a, b); return a.title !== b.title}),

      // switch to new search observable each time the term changes
      switchMap((query: Query) => this.searchMovies(query)),
    );
  }

  searchMovies(query: Query): Observable<Movie[]> {
    console.log(query);
    let url: string;

    if (!query.title || (query.title && query.title.length < 3)) {
      // if not search term, return empty movie array.
      return of([]);
    } else {
      url = this.omdbApiUrl + `&s=${query.title}`;
    }

    if (query.type) {
      url = url + `&type=${query.type}`;
    }

    if (query.year) {
      url = url + `&y=${query.year}`;
    }

    // return this.http.get<Movie[]>(`${this.omdbApiUrl}/?s=${query.title}`).pipe(
      return this.http.get<Movie[]>(url)
        .pipe(
          tap(_ => console.log(`found movies matching "${query.title}"`)),
          map(res => res['Search'])
          // catchError(this.handleError<Movie[]>('searchHeroes', []))
      );
  }
}
