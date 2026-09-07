import { Star } from "lucide-react";
import { Link } from "react-router-dom";

const reviews = [
  {
    id: 1,
    rating: "5.0",
    title: "Worth every pound",
    comment:
      "Second pair I buy. The leather softens beautifully and the sizing is consistent.",
  },
  {
    id: 2,
    rating: "4.0",
    title: "Nice drape",
    comment: "Tailoring is clean, though the hem needed a small adjustment.",
  },
];

export default function ReviewsWidget() {
  return (
    <section className="panel p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Reviews to moderate</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            2 awaiting approval
          </p>
        </div>

        <Link
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs"
          to="/admin/reviews"
        >
          <Star className="size-4" />
          Reviews
        </Link>
      </div>

      <ul className="space-y-3">
        {reviews.map((review) => (
          <li key={review.id} className="space-y-1">
            <span className="flex items-center gap-2">
              <span className="num text-xs font-medium text-warning-foreground">
                {review.rating}★
              </span>

              <span className="truncate text-sm font-medium">
                {review.title}
              </span>
            </span>

            <p className="line-clamp-2 text-xs text-muted-foreground">
              {review.comment}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
