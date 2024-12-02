import { Button } from "@/components/ui/button";

interface CategoryButtonsProps {
  categories: string[];
  onCategoryClick: (category: string) => void;
}

export function CategoryButtons({ categories, onCategoryClick }: CategoryButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {categories.map((category) => (
        <Button
          key={category}
          variant="outline"
          size="sm"
          onClick={() => onCategoryClick(category)}
          className="capitalize"
        >
          {category}
        </Button>
      ))}
    </div>
  );
}
