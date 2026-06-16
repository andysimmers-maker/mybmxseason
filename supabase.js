import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://bigozatjuwywgwkkcyjz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpZ296YXRqdXd5d2d3a2tjeWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MzU4NjksImV4cCI6MjA5NzIxMTg2OX0.7LsPqMhaEu5VlZICjKiZs-IFQpOvZ_iMUzHKVo-l1CQ"
);
