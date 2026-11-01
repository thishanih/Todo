import { useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import type { Todo, TodoPayload } from '@/interfaces/todo.interface';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const todoFormSchema = yup.object({
  title: yup
    .string()
    .trim()
    .required('Add a title for this todo.')
    .max(200, 'Keep the title under 200 characters.'),
  description: yup
    .string()
    .trim()
    .max(2000, 'Keep the description under 2,000 characters.')
    .defined(),
});

type TodoFormValues = yup.InferType<typeof todoFormSchema>;

interface TodoDialogProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (payload: TodoPayload) => void;
  todo: Todo | null;
}

export function TodoDialog({
  isOpen,
  isSubmitting,
  onOpenChange,
  onSubmit,
  todo,
}: TodoDialogProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<TodoFormValues>({
    resolver: yupResolver(todoFormSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        title: todo?.title ?? '',
        description: todo?.description ?? '',
      });
    }
  }, [isOpen, reset, todo]);

  const submitForm = handleSubmit((values) => {
    onSubmit({
      title: values.title.trim(),
      description: values.description.trim() || undefined,
    });
  });

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        if (!isSubmitting) onOpenChange(nextOpen);
      }}
      open={isOpen}
    >
      <DialogContent className="gap-6 rounded-2xl p-6 sm:p-7">
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="text-xl">
            {todo ? 'Edit todo' : 'Create a todo'}
          </DialogTitle>
          <DialogDescription>
            {todo
              ? 'Make a quick update to your task.'
              : 'Capture it now. You can add more details later.'}
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-5"
          onSubmit={(event) => void submitForm(event)}
        >
          <div className="space-y-2">
            <Label htmlFor="todo-title">Title</Label>
            <Input
              aria-invalid={Boolean(errors.title)}
              autoFocus
              id="todo-title"
              maxLength={200}
              placeholder="What needs to get done?"
              {...register('title')}
            />
            {errors.title?.message && (
              <p className="text-sm text-destructive" role="alert">
                {errors.title.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="todo-description">
              Description{' '}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <textarea
              aria-invalid={Boolean(errors.description)}
              className="flex min-h-28 w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive"
              id="todo-description"
              maxLength={2000}
              placeholder="Add a few helpful details..."
              {...register('description')}
            />
            {errors.description?.message && (
              <p className="text-sm text-destructive" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>
          <DialogFooter className="pt-1">
            <Button
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting
                ? 'Saving...'
                : todo
                  ? 'Save changes'
                  : 'Create todo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
