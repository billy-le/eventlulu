import { useSession } from "next-auth/react";
import { DefaultLayout } from "~/layouts/default";

import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/utils/api";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

const loginSchema = z
  .object({
    name: z.string().optional(),
    currentPassword: z.string().optional(),
    password: z.string().optional(),
    password2: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.password && !data.currentPassword) return false;
      return true;
    },
    {
      message: "Enter your current password",
      path: ["currentPassword"],
    }
  )
  .refine((data) => data?.password === data?.password2, {
    message: "Passwords do not match",
    path: ["password2"],
  });

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const usersApi = api.users.updateUser.useMutation();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      name: session?.user?.name ?? "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    await usersApi.mutate(
      {
        id: session!.user.id,
        name: values.name,
        password: values.password,
        currentPassword: values.currentPassword,
      },
      {
        onSuccess: (data) => {
          update(data);
          toast({
            title: "Success!",
            description: "Your profile has been updated.",
            action: <ToastAction altText="acknowledge">OK</ToastAction>,
          });
        },
      }
    );
  }

  if (!session?.user) return <div />;

  return (
    <DefaultLayout>
      <Form {...form}>
        <form
          className="mx-auto max-w-md space-y-10"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h2 className="whitespace-nowrap text-2xl text-gray-800">
                Update Name
              </h2>
              <div className="h-[1px] w-full bg-red-400"></div>
            </div>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h2 className="whitespace-nowrap text-2xl text-gray-800">
                Update Password
              </h2>
              <div className="h-[1px] w-full bg-red-400"></div>
            </div>

            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Re-enter Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormItem className="flex justify-end">
            <Button type="submit" disabled={usersApi.isLoading}>
              Save
            </Button>
          </FormItem>
        </form>
      </Form>
    </DefaultLayout>
  );
}
