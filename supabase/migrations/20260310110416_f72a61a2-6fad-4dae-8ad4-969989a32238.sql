
-- Allow new users to insert their own role (for signup)
CREATE POLICY "Users can insert own role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());
