import MovieDetailComponent from '@/components/movieDetails/MovieDetails';

export default async function MovieDetail({ params }) {
  const { id } = await params;
  return <MovieDetailComponent movieId={id} />;
}
